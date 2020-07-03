import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  constructor(private  authService:  AuthService, private  router:  Router) { }

  ngOnInit() {
  }

  signIn(form){
    this.authService.signIn(form.value).then((isOk) => { 
      if(isOk) this.router.navigateByUrl('map');     
    });
  }
  googleSignIn() {
    this.authService.googleSignIn().then(() => { 
      this.router.navigateByUrl('map');     
    });
  }

}
