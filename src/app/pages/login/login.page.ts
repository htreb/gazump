import { Component, OnInit } from '@angular/core';
import {
  Validators,
  ValidatorFn,
  AbstractControl,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
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

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    // private auth: AuthService,
    // private toastCtrl: ToastController,
    // private router: Router,
    // private loadingCtrl: LoadingController,
    ) {}

  ngOnInit() {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
      if (this.showResetPasswordEmailWarning || this.returningMember) {
        return null;
      }
      if (this.password.length < 6) {
        return { passwordTooShort: true };
      }
      if (this.password !== this.confirmPassword) {
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
  get confirmPassword() {
    return this.signInForm
      ? this.signInForm.get('passwords.confirmPassword').value
      : '';
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
    // const loading = await this.loadingCtrl.create({
    //   message: 'Logging you in...'
    // });
    // await loading.present();

    // this.auth.logIn(this.email, this.password).then(resp => {
    //   loading.dismiss();
    // });

  }

  /**
   * Signs new user up
   */
  async signUp() {
    // const loading = await this.loadingCtrl.create({
    //   message: 'Signing you up...'
    // });
    // await loading.present();

    // this.auth.signUp(this.email, this.password).then(resp => {
    //   loading.dismiss();
    // });
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
      // Show toast to confirm sending email
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
   * Confirm triggers sending the email !TODO!
   *
   * Dismiss does nothing
   */
  async confirmResetPasswordEmail() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: `Are you sure you want to send a reset password email to:
                <br><br>
                ${this.email}?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            // this.auth.sendResetEmail(this.email);
          }
        }
      ]
    });
    await alert.present();
  }
}
