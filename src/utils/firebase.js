import firebase from 'firebase';
import config from '../config'

firebase.initializeApp(config.firebase);

export const database = firebase.database();