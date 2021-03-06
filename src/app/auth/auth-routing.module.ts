import { NgModule } from "@angular/core";
import { LoginComponent } from "../auth/login/login.component";
import { SignupComponent } from "../auth/signup/signup.component";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];

@NgModule({
  imports:[
    RouterModule.forChild(routes)
  ]
})
export class AuthRoutingModule{

}
