import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  logeado = false;
  admin = false;
  usuario : any;

  constructor(private afAuth: AngularFireAuth) { 

  }

  public async logIn(email : string, password : string)
  {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }
  
  public async register(email : string, password : string)
  {    
    return await this.afAuth.createUserWithEmailAndPassword(email,password);    
  }

  public async sendVerificationEmail()
  {
    return (await this.afAuth.currentUser)?.sendEmailVerification();
  }
  
  public async logOut()
  {
    this.logeado = false;
    this.admin = false;
    return await this.afAuth.signOut();
  }

  public async getUserUid()
  {
    return new Promise<string | null>((resolve, reject) => 
    {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null); 
        }
      });
    });
  }  
}
