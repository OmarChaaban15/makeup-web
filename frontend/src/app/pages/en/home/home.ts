import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** English home page (/en). Written in English, not machine-translated: see shared/idioma.ts. */
@Component({
  selector: 'app-en-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class EnHome {}
