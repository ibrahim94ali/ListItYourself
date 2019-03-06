// tslint:disable
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Injectable, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

import {Component, Directive} from '@angular/core';
import {Settings} from '../pages/settings/settings';
import {ToastController, NavController, AlertController} from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
let node = null;
describe('Settings', () => {
  let fixture;
  let component;

  beforeEach(() => {
    
    TestBed.configureTestingModule({
      declarations: [
        Settings
      ],
      providers: [
        ToastController,
        NavController,
        AlertController,
        AngularFireAuth,
        AngularFireDatabase,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(Settings);
    component = fixture.debugElement.componentInstance;    
    
  });

  it('should create a component', async () => {
    expect(component).toBeTruthy();
  });
  
    
  it('should run #emailChange()', async () => {
    let email = "";
    let result = component.emailChange(email);
    expect(result).toBe("Empty e-mail");
    email = "sdfsdsg@itu.edu.tr";
    result = component.emailChange(email);
    expect(result).toBe("Invalid e-mail");
    email = "seymanurakti@gmail.com";
    result = component.emailChange(email);
    expect(result).toBe("E-mail in use");
    email = "akti15@itu.edu.tr";
    result = component.emailChange(email);
    expect(result).toBe("Success");
  });
        
  it('should run #passwordChange()', async () => {
    let pass1 = "";
    let pass2 = "";
    let result = component.passwordChange(pass1, pass2);
    expect(result).toBe("Empty passwords");
    pass1 = "hello";
    pass2 = "world";
    result = component.passwordChange(pass1, pass2);
    expect(result).toBe("Invalid password, less than 6 characters");
    pass1 = "helloworld";
    pass2 = "worldhello";
    result = component.passwordChange(pass1, pass2);
    expect(result).toBe("Passwords does not match");
    pass1 = "helloworld";
    pass2 = "helloworld";
    result = component.passwordChange(pass1, pass2);
    expect(result).toBe("Success");
  });
        
  it('should run #infoChange()', async () => {
    let name = "";
    let surname = "";
    let result = component.infoChange(name, surname);
    expect(result).toBe("Empty name or surname");
    name = "Renur";
    surname = "Aktı";
    result = component.infoChange(name, surname);
    expect(result).toBe("Success");
  });
        
  it('should run #logout()', async () => {
    let result = component.logout();
    expect(result).toBeTruthy;
  });
        
});
