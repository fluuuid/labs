/* global FB window fb */

import React, { Component } from 'react';
import tableify from 'tableify';

const permissions = [
  'user_hometown',
  'public_profile',
  'email',
  'user_location',
  'user_photos',
  'user_education_history',
  'user_relationships',
  'user_relationships_details',
  'user_religion_politics',
  'user_tagged_places',
  'user_videos',
  'user_website',
  'user_work_history',
];

const fields = 'birthday,age_range,currency,devices,education,email,hometown,gender,favorite_teams,cover,work';

export default class App extends Component {

  state = {
    user: {},
  }

  componentDidMount() {
    this.checkLoginState();
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
    // if (response.status === 'not_authorized') {
    // } else {
    //   this.getFBProfile();
    // }
  }

  checkLoginState = () => {
    FB.getLoginStatus(this.statusChangeCallback);
  }

  render() {
    if (this.state.user.name) {
      const node = tableify(this.state.user);
      return (<div dangerouslySetInnerHTML={{ __html: node }} />);
    }

    return (
      <div>
        <button onClick={this.checkLoginState}>Login</button>
      </div>
    );
  }
}
