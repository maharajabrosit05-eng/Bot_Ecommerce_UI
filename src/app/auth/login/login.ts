import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})

export class LoginComponent {
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);



  @ViewChild('bgVideo')
  bgVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {

    const video = this.bgVideo.nativeElement;

    video.muted = true;
    video.autoplay = true;
    video.loop = true;

    video.load();

    video.play().catch(() => {

      setTimeout(() => {

        video.play();

      }, 100);

    });

  }
  form: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());

  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    const { userName, password } = this.form.getRawValue();

    const result = await this.auth.login(
      userName!,
      password!
    );

    this.loading.set(false);
    if (result.ok) {

      this.router.navigate(['/home']);
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false
      });


    } else {
      this.errorMessage.set(result.message ?? 'Login failed. Please try again.');
    }
  }
}
