import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';

  constructor(fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      password_conf: ['', Validators.required]
    });
  }

  register() {
    this.authService.registerUser(
      this.registerForm.value['username'],
      this.registerForm.value['firstName'],
      this.registerForm.value['lastName'],
      this.registerForm.value['email'],
      this.registerForm.value['password']
    ).subscribe(
      res => {
        this.router.navigate(['/login']);
      },
      res => {
        this.error = res.error.message;
      }
    );
  }
}
