import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { User } from './user';
import { Observable, BehaviorSubject } from 'rxjs';

// Use parse with typescript
import * as Parse from 'parse';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authSubject = new BehaviorSubject(false);

  constructor(
    private alertCtrl: AlertController
  ) {
    // Parse init already done in app.component
    // Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY);
    // parse.serverURL = environment.serverURL;
    // Parse.enableEncryptedUser();
    // Parse.secret = 'my Secrey Key';
  }

  isSignedIn():Observable<boolean> {
    return this.authSubject.asObservable();
    // return Parse.User.current().get('emailVerified');
    // this.authSubject.next(true);
  }

  register(user: User): Promise<boolean> {
    const parseUser = new Parse.User();
    parseUser.set("username", user.name);
    parseUser.set("email", user.email);
    parseUser.set("password", user.password);
    // other fields can be set just like with Parse.Object
    // parseUser.set("phone", "415-392-0202");
    return parseUser.signUp(null).then((resp) => {
      console.log('Register successfully', resp);
      return true
    }, err => {
      console.log('Error ' + err.code + ' registering', err);
      this.alertCtrl.create({
        header: 'Error',
        message: err.message,
        buttons: ['Ok']
      }).then(res => res.present());
      return false
    });
    // is automatically save https://docs.parseplatform.org/js/guide/#current-user
    // emailVerified
  }

  signIn(user: User): Promise<boolean> {
    return Parse.User.logIn(user.email, user.password).then((parseUser) => {
      console.log('Signed in successfully', parseUser);
      if (parseUser.get('emailVerified')) {
        // If you app has Tabs, set root to TabsPage
        // this.navCtrl.setRoot('HomePage')
        this.authSubject.next(true);
        return true;
      } else {
        Parse.User.logOut().then((resp) => {
          console.log('Signed out successfully', resp);
        }, err => {
          console.log('Error signing out', err);
        });
        this.alertCtrl.create({
          header: 'Alert',
          message: 'Your e-mail address must be verified before sign in.',
          buttons: ['Ok']
        }).then(res => res.present());
        return false;
      }
    }, err => {
      console.log('Error ' + err.code + ' signing in', err);
      this.alertCtrl.create({
        header: 'Error',
        message: err.message,
        buttons: ['Ok']
      }).then(res => res.present());
      return false;
    });
  }
  async googleSignIn() {
    // https://docs.parseplatform.org/parse-server/guide/
    // let id=environment.googleIDdeCliente;
    // let id_token=environment.googleSecretoDeCliente;
    // let authData = {
    //     authData: {
    //         id: id,
    //         id_token: id_token
    //     }
    // };
    // var provider = {
    //     authenticate(options) {
    //         if (options.success) {
    //             options.success(this, authData);
    //         }
    //     },
    //     restoreAuthentication(authData) {},
    //     getAuthType() {
    //         return 'google';
    //     },
    //     deauthenticate() {}
    // };
    // let user = new Parse.User();
    // user.logInWith(provider, authData).done(function (result) {
    //     console.log(result);
    // }).fail(function (error) {
    //     console.log(error);
    // });

    // const user = await new Parse.User().linkWith('google', {authData: {id, id_token}});

    /*
    parse config:

    var parseApi = new ParseServer({
      ...
      oauth: {
        google: {}
      },
      ...
    */
  }

  signOut() {
    Parse.User.logOut().then((resp) => {
      console.log('Signed out successfully', resp);
      this.authSubject.next(false);
    }, err => {
      console.log('Error signing out', err);
    })
  }

  resetPassword(email) {
    Parse.User.requestPasswordReset(email)
      .then(() => {
        // Password reset request was sent successfully
        this.alertCtrl.create({
          header: 'Alert',
          message: 'Check your e-mail for password reset.',
          buttons: ['Ok']
        }).then(res => res.present());
      }).catch((err) => {
        // Show the error message somewhere
        console.log('Error ' + err.code + ' reseting password', err);
        this.alertCtrl.create({
          header: 'Error',
          message: err.message,
          buttons: ['Ok']
        }).then(res => res.present());
      });
  }
}
