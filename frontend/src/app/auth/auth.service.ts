import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

import { Storage } from '@ionic/storage';
import { User } from './user';
import { AuthResponse } from './auth-response';

// Use parse with typescript
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  AUTH_SERVER_ADDRESS: string = 'http://localhost:3000';
  authSubject = new BehaviorSubject(false);

  constructor(private httpClient: HttpClient, private storage: Storage) { }

  isLoggedIn() {
    return this.authSubject.asObservable();
  }

  register(user: User): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.AUTH_SERVER_ADDRESS}/register`, user).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set("ACCESS_TOKEN", res.user.access_token);
          await this.storage.set("EXPIRES_IN", res.user.expires_in);
          this.authSubject.next(true);
        }
      })

    );
  }
  signUp(user: User) {
    Parse.User.signUp(user.email, user.password, null).then((resp) => {
      console.log('Logged in successfully', resp);
    }, err => {
      console.log('Error signing in', err);      
    });
    // const user = new Parse.User();
    // user.set("username", 'this.email');
    // user.set("email", 'this@email.com');
    // user.set("password", 'this.password');
    // user.set("rememberMe", true);
    // user.signUp(null).then(
    //     function(user) {
    //         alert('User created successfully with email: ' + user.get("email"));
    //     },
    //     function(error) {
    //         alert("Error " + error.code + ": " + error.message);
    //     }
    // );
      //     var user = new Parse.User();
      // user.set("username", "my name");
      // user.set("password", "my pass");
      // user.set("email", "email@example.com");

      // // other fields can be set just like with Parse.Object
      // user.set("phone", "415-392-0202");
      // try {
      //   await user.signUp();
      //   // Hooray! Let them use the app now.
      // } catch (error) {
      //   // Show the error message somewhere and let the user try again.
      //   alert("Error: " + error.code + " " + error.message);
      // }

// is automatically save https://docs.parseplatform.org/js/guide/#current-user

      // emailVerified
  }

  login(user: User): Observable<AuthResponse> {
    return this.httpClient.post(`${this.AUTH_SERVER_ADDRESS}/login`, user).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set("ACCESS_TOKEN", res.user.access_token);
          await this.storage.set("EXPIRES_IN", res.user.expires_in);
          this.authSubject.next(true);
        }
      })
    );
  }  
  signIn(user: User) {
//     Parse.enableEncryptedUser();
// Parse.secret = 'my Secrey Key';
    Parse.User.logIn(user.email, user.password).then((resp) => {
      console.log('Logged in successfully', resp);      
    }, err => {
      console.log('Error logging in', err);
    });
  }
//   signIn with email verification() {
//     Parse.User.logIn(this.username, this.password).then((user) => {
//         console.log('Logged in successfully', user);

//         if(user.get('emailVerified')) {
//             // If you app has Tabs, set root to TabsPage
//             this.navCtrl.setRoot('HomePage')
//         } else {
//             Parse.User.logOut().then((resp) => {
//                 console.log('Logged out successfully', resp);
//             }, err => {
//                 console.log('Error logging out', err);
//             });

//             this.alertCtrl.create({
//                 title: 'E-mail verification needed',
//                 message: 'Your e-mail address must be verified before logging in.',
//                 buttons: ['Ok']
//             }).present();
//         }
//     }, err => {
//         console.log('Error logging in', err);

//         this.toastCtrl.create({
//         message: err.message,
//         duration: 2000
//         }).present();
//     });
// }


  async logout() {
    await this.storage.remove("ACCESS_TOKEN");
    await this.storage.remove("EXPIRES_IN");
    this.authSubject.next(false);
  }
  ParselogOut() {
    Parse.User.logOut().then((resp) => {
      console.log('Logged out successfully', resp);
    }, err => {
      console.log('Error logging out', err);
    })
  }

//   resetPassword() {
//     Parse.User.requestPasswordReset("email@example.com")
// .then(() => {
//   // Password reset request was sent successfully
// }).catch((error) => {
//   // Show the error message somewhere
//   alert("Error: " + error.code + " " + error.message);
// });
//   }
}
