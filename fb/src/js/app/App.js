/* global FB window fb */

import React, { Component } from 'react';
import tableify from 'tableify';

const permissions = [
  'user_hometown',
  'public_profile',
  'email',
  'user_location',
  // 'user_photos',
  'user_education_history',
  'user_relationships',
  // 'user_relationships_details',
  // 'user_religion_politics',
  // 'user_tagged_places',
  // 'user_videos',
  // 'user_website',
  // 'user_work_history',
];

const fields = 'birthday,age_range,currency,devices,education,email,hometown,gender,favorite_teams,cover,name';

export default class App extends Component {

  state = {
    user: {},
  }

  getFBProfile = (e) => {
    console.log(e);
    if (e.status !== 'not_authorized' && !e.error) {
      FB.api(`/${e.authResponse.userID}`, 'get', {
        access_token: e.authResponse.accessToken,
        fields,
      }, this.profileResponse);
    }
  }

  profileResponse = (e) => {
    console.log(e);
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
      const node = tableify(this.state.user);
      const { cover } = this.state.user;
      return (
        <div className="jumbotron">
          <img src={cover.source} alt="Cover" />
          <div
            className="jumbotron"
            dangerouslySetInnerHTML={{ __html: node }}
          />
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
