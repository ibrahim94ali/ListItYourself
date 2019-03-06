import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SignUp } from '../signUp/signup';
import { AngularFireAuth } from 'angularfire2/auth'
import { Settings } from '../settings/settings';
import { auth } from 'firebase';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class Login {

  user = {
    usernameemail : "",
    password : ""
  }

  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController, public alertCtrl: AlertController, public toastCtrl: ToastController) {


  }

  forgotPassword()
  {
      this.showPromptForgotPassword();
  }

  forgottenEmailUsername(ue)
  {
    const result = this.afAuth.auth.sendPasswordResetEmail(ue);
    console.log(result);
    result
    .then(() =>  this.presentToastDone())
    .catch(e => {
      if(e.code === "auth/user-not-found")
      {
        this.emailNotFound();
      }
      else if(e.code === "auth/invalid-email")
            {
             this.emailBadlyFormatted();
            }
            else{
              console.log(e);
            }
    });
    this.user.usernameemail = ue;
  }

  signUp()
  {
      this.navCtrl.push(SignUp);
  }

  async signIn()
  {
      if(this.user.usernameemail === "" || this.user.password === ""){
        const prompt = this.alertCtrl.create({
          title: 'Please fill required blanks!',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              console.log('OK clicked');
              }
            },
          ]
        })
        prompt.present();
      }

      else{
        const result = this.afAuth.auth.signInWithEmailAndPassword(this.user.usernameemail,
          this.user.password);
          result
          .then(() => this.navCtrl.setRoot(HomePage))
          .catch(e => {
            if(e.code === "auth/user-not-found")
            {
              this.emailNotFound();
              
            }
            else if(e.code === "auth/wrong-password")
            {
              const prompt = this.alertCtrl.create({
                title: 'Incorrect password.',
                buttons: [
                  {
                    text: 'OK',
                    handler: data => {
                    console.log('OK clicked');
                    }
                  },
                ]
              })
              prompt.present();
              
            }
            else if(e.code === "auth/invalid-email")
            {
             this.emailBadlyFormatted();
            }
            else{
              console.log(e);
            }
        });
      }
  }
 
  showPromptForgotPassword() {
    const prompt = this.alertCtrl.create({
      title: 'Forgot Password',
      message: "Enter your username or email",
      inputs: [
        {
          name: 'name',
          placeholder: 'Username or Email',
          value: this.user.usernameemail
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
          console.log('Saved clicked');
          this.forgottenEmailUsername(data.name);
          }
        }
      ]
    });
    prompt.present();
  }
 
  presentToastDone() {
    const toast = this.toastCtrl.create({
      message: 'A link has sent to your email.',
      duration: 4000,
      position: 'top'
    });

    toast.present();
  }
  
  emailBadlyFormatted()
  {
    const prompt = this.alertCtrl.create({
      title: 'Email is badly formatted.',
      buttons: [
        {
          text: 'OK',
          handler: data => {
          console.log('OK clicked');
          }
        },
      ]
    })
    prompt.present();

  }
  emailNotFound()
  {
    const prompt = this.alertCtrl.create({
      title: 'This e-mail is not registered.',
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        },
      ]
    })
    prompt.present();

  }
}
