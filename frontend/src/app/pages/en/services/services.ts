import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** English services page (/en/services). */
@Component({
  selector: 'app-en-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.html'
})
export class EnServices {}
