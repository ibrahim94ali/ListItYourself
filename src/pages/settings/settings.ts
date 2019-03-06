import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { Login } from '../login/login';
import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase }  from 'angularfire2/database';
import { Userinfo } from '../../models/userinfo';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class Settings {

  user = {} as User
  userinfo = {} as Userinfo

  constructor( public toastCtrl: ToastController, public navCtrl: NavController, public alertCtrl: AlertController, private afAuth: AngularFireAuth,  private afDatabase: AngularFireDatabase) {

  }

  passwordcheck = {
    pass1 : "",
    pass2 : ""
  }

  emailChange()
  {
    if(this.user.email === "")
    {
      const prompt = this.alertCtrl.create({
        title: 'Please enter your email!',
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
    else{

      const result = this.afAuth.auth.currentUser.updateEmail(this.user.email);
      result
    .then(() =>  this.presentToastDone())
    .catch(e => {
      if(e.code === "auth/email-already-in-use")
      {
        this.emailInUseError();
      }
      else if(e.code === "auth/invalid-email")
            {
             this.emailNotValidError();
            }
      else if(e.code === "auth/requires-recent-login")
      {
        this.recentLoginError();
      }
            else{
              console.log(e);
            }
    });
    
    }
  }

  passwordChange()
  {
    if(this.passwordcheck.pass1 === "" || this.passwordcheck.pass2 === "")
      {
        const prompt = this.alertCtrl.create({
          title: 'Please fill required blanks.',
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
    else if(this.passwordcheck.pass1 != this.passwordcheck.pass2)
      {
        const prompt = this.alertCtrl.create({
          title: 'Passwords do not match.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })
        prompt.present();
        this.passwordcheck.pass1 = "";
        this.passwordcheck.pass2 = "";
      }
      else if (this.passwordcheck.pass1.length < 6) {
    
        const prompt = this.alertCtrl.create({
          title: 'Password should be at least 6 characters.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })

        prompt.present();
        this.passwordcheck.pass1 = "";
        this.passwordcheck.pass2 = "";
      }

    else{
      this.user.password = this.passwordcheck.pass1;
      const result = this.afAuth.auth.currentUser.updatePassword(this.user.password);
      result.then(() =>  this.presentToastDone())
      .catch(e => {
        if(e.code === "auth/requires-recent-login")
        {
          this.recentLoginError();
        }

      });
    }
  }

  infoChange()
  {
    if(this.userinfo.name === "" || this.userinfo.surname === "")
      {
        const prompt = this.alertCtrl.create({
          title: 'Please fill required blanks.',
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

    else{
      try{
        const result = this.afAuth.authState.take(1).subscribe(auth=> {
            this.afDatabase.object(`/UserProfile/${auth.uid}`).update(this.userinfo)
            .then(() =>  {
              this.presentToastDone()});
        });
      }
      catch(e)
      {
        console.log(e);
      }
  }

  }

  logout()
  {
    const result = this.afAuth.auth.signOut();
    result
      .then(()=>{
      this.navCtrl.setRoot(Login);
  })
  .catch((e)=> {
    console.log(e);
  });
  }

  emailAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Change Email',
        message: "Enter your new email",
        inputs: [
          {
            name: 'email',
            placeholder: 'Email'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
            }
          },
          {
            text: 'Save',
            handler: data => {
             
              this.user.email = data.email;
              this.emailChange();
            }
          }
        ]
      });
      prompt.present();
  }

  passwordAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Change Password',
        message: "Enter your new password twice",
        inputs: [
          {
            name: 'password1',
            type: 'password',
            placeholder: 'Password'
          },
          {
            name: 'password2',
            type: 'password',
            placeholder: 'Re-Password'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
            }
          },
          {
            text: 'Save',
            handler: data => {
              this.passwordcheck.pass1 = data.password1;
              this.passwordcheck.pass2 = data.password2;
              this.passwordChange();
            }
          }
        ]
      });
      prompt.present();
  }

  infoAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Change Personal Information',
        message: "Enter your new personal information.",
        inputs: [
          {
            name: 'name',
            placeholder: 'name'
          },
          {
            name: 'surname',
            placeholder: 'surname'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
            }
          },
          {
            text: 'Save',
            handler: data => {
              this.userinfo.name = data.name;
              this.userinfo.surname = data.surname;
              this.infoChange();
            }
          }
        ]
      });
      prompt.present();
  }

  emailInUseError()
      {
        const prompt = this.alertCtrl.create({
          title: 'E-mail is already used for another user.',
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
  emailNotValidError()
  {
    const prompt = this.alertCtrl.create({
      title: 'Invalid e-mail.',
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

  presentToastDone() {
    const toast = this.toastCtrl.create({
      message: 'Done successfully.',
      duration: 3000,
      position: 'bottom'
    });

    toast.present();
  }

  recentLoginError(){
    const prompt = this.alertCtrl.create({
      title: 'Please sign in first to do this operation.',
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.afAuth.auth.signOut();
            this.navCtrl.setRoot(Login);
          }
        },
      ]
    })

    prompt.present();

  }
}
