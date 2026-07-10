import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

interface RoleMapping {
  id: number;
  name: string;
}

@Component({
  selector: 'dpdpa-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <!-- ── Top Header Bar ── -->
      <header class="header-bar">
        <div class="header-logo-container">
          <img src="assets/logo.png" alt="Jodetx Logo" class="brand-logo-img" />
        </div>
        <a href="mailto:support@jodetx.com" class="help-link">Need Help ?</a>
      </header>

      <!-- ── Main Grid Layout ── -->
      <div class="main-container">
        <!-- ── Left Column: Value Prop & Tablet Graphic ── -->
        <div class="content-left">
          <h1 class="hero-title">Empowering Businesses with Smarter Financial Solutions.</h1>
          <p class="hero-subtitle">
            We at Jode Technology help businesses streamline finances, manage operations, and strengthen customer connections with smart, simple tech.
          </p>
          <div class="tablet-wrapper">
            <img src="assets/tablet_dashboard_mockup.png" alt="Dashboard Mockup" class="tablet-image" />
          </div>
        </div>

        <!-- ── Right Column: Sign-in Card ── -->
        <div class="content-right">
          <div class="login-card">
            <!-- Centered Logo inside card -->
            <div class="card-logo-container">
              <img src="assets/logo.png" alt="Jodetx Logo" class="card-logo-img" />
            </div>

            <h2 class="card-title">Welcome to Jode Technologies Private Limited!</h2>
            <div class="card-subtitle">Sign in to your account</div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- STEP 1: Email or Mobile Number -->
              <div *ngIf="step === 1" class="form-group">
                <label>Email or Mobile Number <span class="required">*</span></label>
                <input 
                  type="text" 
                  formControlName="email" 
                  placeholder="Enter your Email or Mobile Number" 
                  class="text-input"
                  (keyup.enter)="nextStep()"
                />
                <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="error-msg">
                  Please enter a valid email address or mobile number
                </div>
              </div>

              <!-- STEP 2: Passcode Entry -->
              <div *ngIf="step === 2" class="form-group fade-in">
                <div class="back-link" (click)="prevStep()">← Change email/mobile</div>
                <label style="margin-top: 12px;">Console Passcode <span class="required">*</span></label>
                <input 
                  type="password" 
                  formControlName="password" 
                  placeholder="Enter your 4-digit or 6-digit passcode" 
                  class="text-input"
                  autofocus
                />
                <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="error-msg">
                  Passcode is required
                </div>
              </div>

              <!-- Disclaimer Terms text -->
              <div class="terms-text">
                By continuing, you agree to <strong>Jode Technologies Private Limited <a href="#">Terms & Conditions</a></strong>, and confirm that you have read <strong>Jode Technologies Private Limited <a href="#">Privacy Policy</a></strong>, <strong><a href="#">Cookies Policy</a></strong>.
              </div>

              <!-- Action Button -->
              <button 
                type="submit" 
                class="continue-btn" 
                [disabled]="isButtonDisabled()"
              >
                <span *ngIf="!loading">{{ step === 1 ? 'Continue' : 'Sign In' }}</span>
                <span *ngIf="loading" class="spinner">Verifying...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
    }

    /* ── Top Header Bar ── */
    .header-bar {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }

    /* ── Jodetx Styled Logo ── */
    .header-logo-container {
      display: flex;
      align-items: center;
    }
    .brand-logo-img {
      max-height: 52px;
      width: auto;
    }

    .help-link {
      font-size: 13.5px;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
      transition: color 0.15s;
    }
    .help-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }

    /* ── Main Container ── */
    .main-container {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px 60px;
      flex: 1;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      align-items: center;
      gap: 48px;
      z-index: 5;
    }

    /* ── Left Column styles ── */
    .content-left {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
    }
    .hero-title {
      font-size: 38px;
      font-weight: 850;
      color: #0f172a;
      line-height: 1.25;
      max-width: 580px;
      margin: 0;
    }
    .hero-subtitle {
      font-size: 15.5px;
      color: #2563eb;
      font-weight: 500;
      line-height: 1.6;
      max-width: 540px;
      margin: 0;
    }
    .tablet-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      position: relative;
    }
    .tablet-image {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 20px 30px rgba(15, 23, 42, 0.08));
    }

    /* ── Right Column & Card styles ── */
    .content-right {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .login-card {
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.04);
      width: 440px;
      max-width: 100%;
      padding: 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card-logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
    }
    .card-logo-img {
      max-height: 56px;
      width: auto;
    }

    .card-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 0 0 8px 0;
    }
    .card-subtitle {
      font-size: 14.5px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 28px;
    }

    /* ── Form elements ── */
    .login-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: left;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }
    .required {
      color: #ef4444;
    }

    .text-input {
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13.5px;
      color: #0f172a;
      outline: none;
      transition: all 0.15s ease-in-out;
    }
    .text-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    }

    .error-msg {
      font-size: 11px;
      color: #ef4444;
      margin-top: 3px;
    }

    .back-link {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: inline-block;
      align-self: flex-start;
      transition: color 0.15s;
    }
    .back-link:hover {
      color: #3b82f6;
      text-decoration: underline;
    }

    .terms-text {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 4px;
    }
    .terms-text a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
    .terms-text a:hover {
      text-decoration: underline;
    }

    .continue-btn {
      width: 100%;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      outline: none;
      padding: 13px;
      border-radius: 8px;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15);
    }
    .continue-btn:hover:not(:disabled) {
      background: #4338ca;
    }
    .continue-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive Adaptation ── */
    @media (max-width: 992px) {
      .main-container {
        grid-template-columns: 1fr;
        gap: 36px;
        padding-bottom: 40px;
      }
      .content-left {
        text-align: center;
        align-items: center;
      }
      .hero-title {
        font-size: 30px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  step = 1;

  // Domain/Email mapping to role config
  private emailToRoleMap: Record<string, RoleMapping> = {
    // Demo Logins
    'admin@jodetx.com': { id: 1, name: 'Site Admin' },
    'dpo@jodetx.com': { id: 2, name: 'DPO' },
    'principal@jodetx.com': { id: 3, name: 'Data Principal' },
    'superadmin@jodetx.com': { id: 4, name: 'Super Admin' },
    // Database logins mapping
    'mayuri.ambelkar@jodetx.com': { id: 1, name: 'Site Admin' },
    'mayuri.test1@jodetx.com': { id: 2, name: 'DPO' },
    'mayuri.test2@jodetx.com': { id: 3, name: 'Data Principal' }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', []]
    });
  }

  isButtonDisabled(): boolean {
    if (this.step === 1) {
      return !this.loginForm.get('email')?.value;
    } else {
      return !this.loginForm.get('password')?.value || this.loading;
    }
  }

  nextStep() {
    const emailVal = this.loginForm.get('email')?.value;
    if (emailVal) {
      this.step = 2;
      this.loginForm.get('password')?.setValidators([Validators.required]);
      this.loginForm.get('password')?.updateValueAndValidity();
    }
  }

  prevStep() {
    this.step = 1;
    this.loginForm.get('password')?.clearValidators();
    this.loginForm.get('password')?.setValue('');
    this.loginForm.get('password')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.step === 1) {
      this.nextStep();
      return;
    }

    if (this.loginForm.invalid) return;
    this.loading = true;

    setTimeout(() => {
      const emailInput = this.loginForm.get('email')?.value.trim().toLowerCase();
      const passwordInput = this.loginForm.get('password')?.value.trim();

      // Find matching user role based on email lookup mapping
      const mappedRole = this.emailToRoleMap[emailInput] || { id: 1, name: 'Site Admin' }; // Fallback to Site Admin

      // Validate passcode (2314 from dpdpa_pwd_mgmt table OR 123456 as standard master passcode)
      const isValidPassword = (passwordInput === '2314' || passwordInput === '123456');

      if (isValidPassword) {
        this.authService.login(emailInput, mappedRole.id, mappedRole.name);
        this.toastService.success('Authentication Successful', `Welcome back, ${mappedRole.name}!`);
        this.router.navigate(['/dashboard']);
      } else {
        this.toastService.error('Authentication Failed', 'Invalid passcode. Please check your password manager.');
      }
      this.loading = false;
    }, 800);
  }
}
