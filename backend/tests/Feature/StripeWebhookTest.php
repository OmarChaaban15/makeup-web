<?php

namespace Tests\Feature;

use App\Models\AccesoTutorial;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    private const SECRETO = 'whsec_pruebas';

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.stripe.webhook_secret', self::SECRETO);
    }

    /**
     * Firma el payload igual que lo hace Stripe, para poder atravesar
     * Webhook::constructEvent sin desactivar la verificacion.
     */
    private function enviar(array $evento)
    {
        $payload = json_encode($evento);
        $ts = time();
        $firma = hash_hmac('sha256', $ts.'.'.$payload, self::SECRETO);

        return $this->call(
            'POST',
            '/api/webhooks/stripe',
            [],
            [],
            [],
            [
                'HTTP_STRIPE_SIGNATURE' => "t={$ts},v1={$firma}",
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            $payload
        );
    }

    private function pedidoPendiente(): array
    {
        $user = User::factory()->create();

        $tutorial = Tutorial::create([
            'titulo' => 'Masterclass',
            'precio' => 45.00,
            'stripe_price_id' => 'price_test_123',
            'video_url' => 'https://youtu.be/ScMzIvxBSi4',
            'activo' => true,
        ]);

        $pedido = Pedido::create([
            'user_id' => $user->id,
            'estado' => 'pendiente',
            'total' => 45.00,
            'metodo_pago' => 'stripe',
        ]);

        PedidoItem::create([
            'pedido_id' => $pedido->id,
            'tutorial_id' => $tutorial->id,
            'precio_unitario' => 45.00,
        ]);

        return [$user, $tutorial, $pedido];
    }

    private function eventoCompletado(Pedido $pedido, string $id = 'evt_1'): array
    {
        return [
            'id' => $id,
            'object' => 'event',
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_test_1',
                'object' => 'checkout.session',
                'client_reference_id' => (string) $pedido->id,
                'payment_intent' => 'pi_test_1',
            ]],
        ];
    }

    public function test_firma_invalida_devuelve_400_y_no_concede_acceso(): void
    {
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->postJson('/api/webhooks/stripe', $this->eventoCompletado($pedido), [
            'Stripe-Signature' => 't=123,v1=firmafalsa',
        ])->assertStatus(400);

        $this->assertDatabaseCount('accesos_tutorial', 0);
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'estado' => 'pendiente']);
    }

    public function test_pago_completado_marca_pagado_y_concede_acceso(): void
    {
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->enviar($this->eventoCompletado($pedido))->assertOk();

        $this->assertDatabaseHas('pedidos', [
            'id' => $pedido->id,
            'estado' => 'pagado',
            'referencia_pago' => 'pi_test_1',
        ]);

        $this->assertDatabaseHas('accesos_tutorial', [
            'user_id' => $user->id,
            'tutorial_id' => $tutorial->id,
            'pedido_id' => $pedido->id,
        ]);
    }

    public function test_el_mismo_evento_reentregado_no_se_procesa_dos_veces(): void
    {
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->enviar($this->eventoCompletado($pedido))->assertOk();
        $this->enviar($this->eventoCompletado($pedido))
            ->assertOk()
            ->assertJson(['status' => 'duplicado']);

        $this->assertDatabaseCount('accesos_tutorial', 1);
    }

    public function test_el_curso_comprado_ya_devuelve_video_url_en_mis_cursos(): void
    {
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->enviar($this->eventoCompletado($pedido))->assertOk();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/mis-cursos')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.video_url', 'https://youtu.be/ScMzIvxBSi4');
    }

    public function test_reembolso_retira_el_acceso(): void
    {
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->enviar($this->eventoCompletado($pedido))->assertOk();
        $this->assertDatabaseCount('accesos_tutorial', 1);

        $this->enviar([
            'id' => 'evt_refund',
            'object' => 'event',
            'type' => 'charge.refunded',
            'data' => ['object' => [
                'id' => 'ch_test_1',
                'object' => 'charge',
                'payment_intent' => 'pi_test_1',
            ]],
        ])->assertOk();

        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'estado' => 'reembolsado']);
        $this->assertDatabaseCount('accesos_tutorial', 0);
    }

    public function test_sin_secreto_configurado_el_webhook_no_acepta_nada(): void
    {
        config()->set('services.stripe.webhook_secret', null);
        [$user, $tutorial, $pedido] = $this->pedidoPendiente();

        $this->enviar($this->eventoCompletado($pedido))->assertStatus(500);
        $this->assertDatabaseCount('accesos_tutorial', 0);
    }
}
