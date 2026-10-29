import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * English contact page (/en/contact). It has no form: the Spanish form posts
 * Spanish option values to the API, so contact here goes through WhatsApp or
 * email.
 */
@Component({
  selector: 'app-en-contact',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact.html'
})
export class EnContact {}
