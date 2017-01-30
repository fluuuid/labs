/* global FB window fb */

import React, { Component } from 'react';
import tableify from 'tableify';
import Photo from './Photo';

const permissions = [
  'user_hometown',
  'public_profile',
  'user_games_activity',
  'user_about_me',
  'email',
  'user_location',
  'user_photos',
  'user_birthday',
  'user_education_history',
  'user_relationships',
  // 'user_relationships_details',
  // 'user_religion_politics',
  'user_tagged_places',
  // 'user_videos',
  // 'user_website',
  'user_work_history',
];

const fields = 'birthday,age_range,currency,devices,education,email,hometown,gender,photos,cover,name,tagged_places,work,albums';

export default class App extends Component {

  state = {
    user: {},
  }

  getFBProfile = (e) => {
    if (e.status !== 'not_authorized' && !e.error) {
      FB.api(`/${e.authResponse.userID}`, 'get', {
        access_token: e.authResponse.accessToken,
        fields,
      }, this.profileResponse);
    }
  }

  profileResponse = (e) => {
    this.setState({ user: Object.assign({}, e) });
  }

  statusChangeCallback = () => {
    FB.login(this.getFBProfile, { scope: permissions.join(','), return_scopes: true });
  }

  checkLoginState = () => {
    FB.getLoginStatus(this.statusChangeCallback);
  }

  render() {
    if (this.state.user.name) {
      const { photos, cover } = this.state.user;
      const whatToShow = Object.assign({}, this.state.user);

      whatToShow.cover = null;
      whatToShow.photos = null;
      delete whatToShow.photos;
      delete whatToShow.cover;

      const node = tableify(whatToShow);
      return (
        <div className="jumbotron">
          <img style={{ width: '100%' }} src={cover.source} alt="Cover" />
          <div
            className="jumbotron"
            dangerouslySetInnerHTML={{ __html: node }}
          />
          <div className="photo-gallery">
            {photos.data.map((e) => {
              return <Photo key={e.id} id={e.id} />;
            })}
          </div>
        </div>);
    }

    return (
      <div className="jumbotron" >
        <h2>Login with Facebook</h2>
        <p>To scrap your data</p>
        <button onClick={this.checkLoginState}>Login</button>
      </div>
    );
  }
}
