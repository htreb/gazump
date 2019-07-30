import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userName: string;

  constructor(private auth: AuthService, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.userName = this.auth.currentUser.value.userName;
  }

  updateName() {
    this.auth.updateUserName(this.userName).then(async () => {
      const toast = await this.toastCtrl.create({
        duration: 3000,
        color: 'success',
        message: `Successfully updated your name to ${this.userName}`
      });
      toast.present();
    });
  }


}
