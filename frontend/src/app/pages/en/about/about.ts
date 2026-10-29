import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** English about page (/en/about). */
@Component({
  selector: 'app-en-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.html'
})
export class EnAbout {}
