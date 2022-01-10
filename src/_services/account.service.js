import { BehaviorSubject } from "rxjs";
import Cookie from "js-cookie";

import config from "config";
import { fetchWrapper, history } from "@/_helpers";

const userSubject = new BehaviorSubject(null);
const baseUrl = `${config.apiUrl}`;
const baseAccountUrl = `${config.apiUrl}/accounts`;

export const accountService = {
  login,
  logout,
  refreshToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  user: userSubject.asObservable(),
  get userValue() {
    return userSubject.value;
  },
};

function login(email, password, csrftoken) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("csrfmiddlewaretoken", csrftoken);
  urlencoded.append("login", "teste-1");
  urlencoded.append("password", "12345678");

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    credentials: "include",
    body: urlencoded,
    redirect: "follow",
  };

  return fetch(`${baseAccountUrl}/login/`, requestOptions)
    .then((response) => response.text())
    .then((userInfo) => {
      const user = JSON.parse(userInfo);
      // const {firstName, lastName, email} = userInfo
      console.log(user.userInfo);
      // publish user to subscribers and start timer to refresh token
      userSubject.next(user.userInfo);
      startRefreshTokenTimer();
      return userInfo;
    });
}

function logout() {
  // revoke token, stop refresh timer, publish null to user subscribers and redirect to login page
  fetchWrapper.post(`${baseAccountUrl}/logout/`, {}, Cookie.get("csrftoken"));
  stopRefreshTokenTimer();
  userSubject.next(null);
  history.push("/account/login");
}

function refreshToken() {
  var requestOptions = {
    credentials: "include",
  };
  fetch(`${baseUrl}/auth/`, requestOptions)
    .then((response) => response.text())
    .then((res) => {
      const { isAuthenticated } = JSON.parse(res);
      if (isAuthenticated) {
        // console.log("User is authenticated in the backend");
        fetchWrapper.get(`${baseUrl}/dashboard/`).then(({ userInfo }) => {
          userSubject.next(userInfo);
          history.push("/");
        });
      }
    });

  return fetchWrapper.get(`${baseUrl}/csrf/`, requestOptions).then((responseData) => {
    // console.log(user);
    // publish user to subscribers and start timer to refresh token
    // userSubject.next(user);
    // startRefreshTokenTimer();
    return responseData;
  });
}

function register(params) {
  return fetchWrapper.post(`${baseUrl}/register`, params);
}

function verifyEmail(token) {
  return fetchWrapper.post(`${baseUrl}/verify-email`, { token });
}

function forgotPassword(email) {
  return fetchWrapper.post(`${baseUrl}/forgot-password`, { email });
}

function validateResetToken(token) {
  return fetchWrapper.post(`${baseUrl}/validate-reset-token`, { token });
}

function resetPassword({ token, password, confirmPassword }) {
  return fetchWrapper.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
}

function getAll() {
  return fetchWrapper.get(baseUrl);
}

function getById(id) {
  return fetchWrapper.get(`${baseUrl}/${id}`);
}

function create(params) {
  return fetchWrapper.post(baseUrl, params);
}

function update(id, params) {
  return fetchWrapper.put(`${baseUrl}/${id}`, params).then((user) => {
    // update stored user if the logged in user updated their own record
    if (user.id === userSubject.value.id) {
      // publish updated user to subscribers
      user = { ...userSubject.value, ...user };
      userSubject.next(user);
    }
    return user;
  });
}

// prefixed with underscore because 'delete' is a reserved word in javascript
function _delete(id) {
  return fetchWrapper.delete(`${baseUrl}/${id}`).then((x) => {
    // auto logout if the logged in user deleted their own record
    if (id === userSubject.value.id) {
      logout();
    }
    return x;
  });
}

// helper functions

let refreshTokenTimeout;

function startRefreshTokenTimer() {
  // parse json object from base64 encoded jwt token
  // const jwtToken = JSON.parse(atob(userSubject.value.jwtToken.split(".")[1]));

  // // set a timeout to refresh the token a minute before it expires
  // const expires = new Date(jwtToken.exp * 1000);
  // const timeout = expires.getTime() - Date.now() - 60 * 1000;
  const timeout = 60 * 1000;
  refreshTokenTimeout = setTimeout(refreshToken, timeout);
}

function stopRefreshTokenTimer() {
  clearTimeout(refreshTokenTimeout);
}
