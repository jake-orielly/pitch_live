<template>
  <div id="user-options-container">
    <button class="ui-button user-option-button" @click="setUserMode('guest')">
      Play As Guest
    </button>
    <button
      class="ui-button user-option-button"
      @click="setUserMode('existing')"
    >
      Login
    </button>
    <button class="ui-button user-option-button" @click="setUserMode('new')">
      Sign Up
    </button>
    <form id="login-form">
      <input
        v-if="userMod"
        v-model="usernameInput"
        ref="usernameInput"
        class="login-input"
        id="username-input"
        type="text"
        placeholder="Username"
        autocomplete="off"
        required
      />
      <input
        v-if="userMod == 'new' || userMod == 'existing'"
        v-model="passwordInput"
        type="password"
        placeholder="Password"
        class="login-input"
        id="password-input"
        required
      />
      <input
        class="ui-button"
        type="submit"
        id="username-confirm"
        v-if="userMod"
        :value="userConfirm[userMod]"
        @click="confirmClick"
      />
    </form>
    <p>{{ loginStatusMap[loginStatus] }}</p>
    <p>{{ signupStatus }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userMod: "",
      usernameInput: "",
      passwordInput: "",
      userConfirm: { 
        guest: "Confirm", 
        existing: "Log In", 
        new: "Sign Up"
      },
      loginStatus: undefined,
      loginStatusMap: {
        success: "Success",
        failure: "Password Incorrect",
        "bad-user": "User does not exist",
      },
      signupStatus: undefined,
    };
  },
  methods: {
    readyClick(name, ready) {
      console.log("Ready:", name, ready);
      if (name == this.username) this.$socket.emit("ready", ready);
    },
    setUserMode(given) {
      this.userMod = given;
      setTimeout(() => {
        this.$refs.usernameInput.focus();
      }, 2);
    },
    confirmClick(e) {
      e.preventDefault();
      switch (this.userMod) {
        case "guest":
          this.guestConfirm();
          break;
        case "existing":
          this.login();
          break;
        case "new":
          this.createAccount();
          break;
      }
    },
    guestConfirm() {
      this.submitUsername();
    },
    submitUsername() {
      this.$parent.signedIn = true;
      this.$parent.username = this.usernameInput;
      this.$parent.showingUserOptionsContainer = false;
      this.$socket.emit("usernameSubmission", {
        usernameSubmission: this.usernameInput,
      });
    },
    login() {
      const Http = new XMLHttpRequest();
      let username = this.usernameInput;
      let password = this.passwordInput;
      const url = `http://23.254.164.217:8000/login?user=${username}&password=${password}`;
      Http.open("POST", url);
      Http.send();

      Http.onreadystatechange = () => {
        if (Http.readyState == 4) {
          var result = JSON.parse(Http.responseText);
          this.loginStatus = result.message;
        }
      };
    },
    createAccount() {
      const Http = new XMLHttpRequest();
      let username = this.usernameInput;
      let password = this.passwordInput;
      const url = `http://23.254.164.217:8000/sign-up?user=${username}&password=${password}`;
      Http.open("POST", url);
      Http.send();

      Http.onreadystatechange = () => {
        if (Http.readyState == 4) {
          var result = JSON.parse(Http.responseText);
          if (result.message) this.signupStatus = result.message;
          else if (result.error) this.signupStatus = "Error: " + result.error;
          else this.signupStatus = "Error: Uknown Error";
        }
      };
    }
  },
};
</script>

<style scoped>
form {
  text-align: center;
}

#username-container {
  text-align: center;
}

.user-option-button {
  display: block;
  margin: 0 auto;
  margin: 2rem auto;
  font-size: 2.5rem;
}

.user-option-button:first-child {
  margin-top: 10%;
}
</style>