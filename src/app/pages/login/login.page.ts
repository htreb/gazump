import { Component, OnInit } from '@angular/core';
import {
  Validators,
  ValidatorFn,
  AbstractControl,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import {
  AlertController,
  ToastController,
} from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  /**
   * @Bool Whether to show sign in or sign up view
   */
  returningMember = true;

  /**
   * variable to hold toast explaining errors with the input
   */
  toast;

  /**
   * @Bool Hides password fields and displays warning to user to enter email used to sign up.
   *
   * Only displays when entered email is invalid
   */
  showResetPasswordEmailWarning = false;

  /**
   * @FormGroup containing email, passwords (password, confirmPassword) and rememberMe checkbox
   */
  signInForm: FormGroup;

  emailErrors = '';
  passwordErrors = '';
  confirmPasswordErrors = '';
  warnErrorsTimeout: NodeJS.Timeout;

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.signInForm = this.fb.group({
      // the below regex is used over the Validators.email as this prevents emails like '2@2' from being valid
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/)
        ]
      ],
      passwords: this.fb.group(
        {
          password: [''],
          confirmPassword: ['']
        },
        {
          validators: this.passwordValidator()
        }
      ),
      rememberMe: ['']
    });

    this.signInForm.valueChanges.subscribe(val => {
      this.clearFormErrorsAndTimeout();
      this.warnErrorsTimeout = setTimeout(() => {
        if (
          this.signInForm.controls.email.dirty &&
          this.signInForm.controls.email.errors
        ) {
          this.emailErrors = 'Please enter a valid email address';
        }
        if (
          this.passwordControl.dirty &&
          this.signInForm.controls.passwords.errors &&
          this.signInForm.controls.passwords.errors.passwordTooShort
        ) {
          this.passwordErrors = 'Password must be a minimum of 6 characters';
        }
        if (
          this.confirmPasswordControl.dirty &&
          this.signInForm.controls.passwords.errors &&
          this.signInForm.controls.passwords.errors.differentPasswords
        ) {
          this.confirmPasswordErrors = 'Passwords do not match';
        }
      }, 500);
    });
  }

  clearFormErrorsAndTimeout() {
    clearTimeout(this.warnErrorsTimeout);
    this.emailErrors = '';
    this.passwordErrors = '';
    this.confirmPasswordErrors = '';
  }

  /**
   * If resetting password or logging in then this check is valid by default.
   *
   * If signing up then password must be longer than 6 characters,
   * and both password and confirmPassword should match
   *
   * @return passwordTooShort, differentPasswords, or null.
   */
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (this.showResetPasswordEmailWarning) {
        return null;
      }
      if (this.password.length < 6) {
        return { passwordTooShort: true };
      }
      if (!this.returningMember && this.password !== this.confirmPassword) {
        return { differentPasswords: true };
      }
      return null;
    };
  }

  /**
   * Helper getter functions for the form values.
   */
  get email() {
    return this.signInForm ? this.signInForm.get('email').value : '';
  }

  get password() {
    return this.signInForm
      ? this.signInForm.get('passwords.password').value
      : '';
  }
  get passwordControl() {
    return this.signInForm
      ? this.signInForm.get('passwords').get('password')
      : { dirty: false };
  }
  get confirmPassword() {
    return this.signInForm
      ? this.signInForm.get('passwords.confirmPassword').value
      : '';
  }
  get confirmPasswordControl() {
    return this.signInForm
      ? this.signInForm.get('passwords').get('confirmPassword')
      : { dirty: false };
  }
  get rememberMe() {
    return this.signInForm ? this.signInForm.get('rememberMe').value : false;
  }

  /**
   * Switches between sign up and sign in layouts.
   *
   * Rechecks validation on password inputs
   * @param signUp boolean for signUp
   */
  toSignUp(signUp: boolean) {
    this.returningMember = signUp;
    this.showResetPasswordEmailWarning = false;
    this.signInForm.get('passwords').updateValueAndValidity();
  }

  /**
   * Function run on submitting the form
   * calls appropriate method (logIn, signUp, or confirmResetPasswordEmail)
   */
  formSubmit() {
    if (this.showResetPasswordEmailWarning) {
      return this.confirmResetPasswordEmail();
    } else if (this.returningMember) {
      return this.logIn();
    } else {
      return this.signUp();
    }
  }

  /**
   * Logs returning user in
   */
  async logIn() {
    this.auth.loading = true;
    this.auth.logIn(this.email, this.password).then(
      user => {
        this.router.navigateByUrl('/');
      },
      async err => {
        this.auth.loading = false;
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message, // TODO more human readable error messages?
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  /**
   * Signs new user up
   */
  async signUp() {
    this.auth.loading = true;
    this.auth.signUp(this.email, this.password).then(
      () => {
        this.router.navigateByUrl('/settings');
      },
      async err => {
        this.auth.loading = false;
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message, // TODO more human readable error messages?
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  /**
   * If entered email is valid then will alert user to confirm reset password email.
   *
   * If invalid email is entered then will set showResetPasswordEmailWarning to true
   * which warns user to enter a valid email.
   */
  forgotPassword() {
    const emailControl = this.signInForm.get('email');
    if (emailControl.valid) {
      // Show alert to confirm sending email
      this.confirmResetPasswordEmail();
    } else {
      // hide password input and display warning for user to enter valid email
      this.showResetPasswordEmailWarning = true;
      // recheck the validity of passwords now (always valid in this case) to remove warnings
      this.signInForm.get('passwords').updateValueAndValidity();
    }
  }

  /**
   * Displays alert asking user to confirm reset password email to entered email.
   *
   * Confirm triggers sending the email TODO
   *
   * Dismiss does nothing
   */
  async confirmResetPasswordEmail() {
    const alert = await this.alertCtrl.create({
      message: `Are you sure you want to send a reset password email to:
                <br><br>
                <b>${this.email}?</b>`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.sendResetPasswordEmail();
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Displays an error toast to the user (used to show which form values are incorrect)
   * @param errorMsg the error message to show to the user
   */
  async showErrors(errorMsg: string) {
    if (!errorMsg) {
      return;
    }
    if (this.toast) {
      this.toast.dismiss();
    }
    this.toast = await this.toastCtrl.create({
      message: errorMsg,
      duration: 3000,
      color: 'danger'
    });
    this.toast.present();
  }

  sendResetPasswordEmail() {
    this.auth.sendResetEmail(this.email).then(
      async res => {
        if (this.toast) {
          this.toast.dismiss();
        }
        this.toast = await this.toastCtrl.create({
          duration: 3000,
          message: 'Success! Check your Emails for more information.',
          color: 'success'
        });
        this.toast.present();
      },
      async err => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err.message, // TODO human readable message
          buttons: ['OK']
        });
        alert.present();
      }
    );
  }

  // TODO REMOVE THIS FUNCTION AND FROM TEMPLATE BEFORE RELEASE
  autoFillCredentials(admin = false) {
    this.signInForm.setValue({
      email: admin ? 'admin@admin.com' : 'dummy@email.com',
      passwords: {
        password: admin ? 'adminadmin' : 'password',
        confirmPassword: admin ? 'adminadmin' : 'password'
      },
      rememberMe: true
    });
  }
}
