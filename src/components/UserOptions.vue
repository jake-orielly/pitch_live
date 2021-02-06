<template>
  <div id="user-options-container">
    <form id="login-form">
      <input
        v-model="usernameInput"
        ref="usernameInput"
        class="login-input white-text"
        id="username-input"
        type="text"
        placeholder="Username"
        autocomplete="off"
        required
      />
      <input
        class="animated-button"
        type="submit"
        id="username-confirm"
        :value="userConfirm[userMod]"
        @click="submitUsername"
      />
    </form>
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
        new: "Sign Up",
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
    submitUsername() {
      this.$parent.signedIn = true;
      this.$parent.username = this.usernameInput;
      this.$emit("usernameSubmitted");
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
    },
  },
};
</script>

<style scoped>
@import "../scss/button.scss";
@import "../scss/common.scss";

form {
  text-align: center;
}

#user-options-container {
  text-align: center;
  padding-top: 15%;
}

#username-input,
#username-confirm {
  font-size: 2rem;
}

#username-confirm {
  margin-top: 3rem;
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

.login-input {
  display: block;
  margin: 0.5em auto;
  background: none;
  border: none;
  text-align: center;
  padding: 0em 0.5rem;
  border-bottom: 2px solid white;
}

.login-input:focus {
  outline: none;
}

.login-input::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: white;
  opacity: 1; /* Firefox */
}
</style>