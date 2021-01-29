<template>
  <div id="chat-container">
    <div id="messages" ref="messagesContainer">
      <div
        v-for="(message, ind) in messages"
        v-bind:key="'message-' + ind"
        class="message-text"
      >
        <div v-if="message.type == 'event'">
          <p class="event-text">
            {{ message.content }}
          </p>
        </div>
        <div v-if="message.type == 'chat'">
          <p>
            <strong>
              {{ message.username }}:
            </strong>
            {{ message.content }}
          </p>
        </div>
      </div>
    </div>
    <div id="chat-ui-container">
      <input
        id="message"
        type="text"
        placeholder="Message"
        v-model="messageText"
        v-on:keyup.13="sendMessage"
      />
      <button id="send" class="send-button" @click="sendMessage">Send</button>
      <button @click="toggleEmojiPicker">😀</button>
    </div>
    <VEmojiPicker 
      v-if="showingEmojiPicker"
      @select="selectEmoji" 
    />
  </div>
</template>

<script>
import { VEmojiPicker } from 'v-emoji-picker';

export default {
  components: {
    VEmojiPicker
  },
  props: {
    username: {
      type: String,
      required: true,
    },
  },
  sockets: {
    chat (data) {
      // When we receive a “chat” event, display the message to the user
      if (typeof data == "string")
        this.messages.push({
          type: "event",
          content: data,
        });
      else
        this.messages.push({
          type: "chat",
          username: data.username,
          content: data.message,
        });
      this.chatScroll();
    },
  },
  data() {
    return {
      messages: [],
      messageText: "",
      showingEmojiPicker: false
    };
  },
  methods: {
    sendMessage() {
      // after hitting send emit a “chat” event to our server with data containing our message and userName
      this.$socket.emit("chat", {
        message: this.messageText,
        username: this.username,
      });
      this.messageText = "";
      this.showingEmojiPicker = false;
      this.chatScroll();
    },
    chatScroll() {
      setTimeout(() => {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      });
    },
    toggleEmojiPicker() {
      this.showingEmojiPicker = !this.showingEmojiPicker;
    },
    selectEmoji(emoji) {
      this.messageText += emoji.data;
    }
  },
};
</script>

<style scoped>
#chat-container {
  display: inline-block;
  position: absolute;
  right: 2em;
  bottom: 1em;
  background-color: lightgrey;
  border-radius: 1em;
  padding: 1em;
  box-shadow: 3px 3px 4px #0000008f;
}

#messages {
  height: 22rem;
  width: 22rem;
  overflow-y: scroll;
}

.message-text {
  color: black;
}

.message-text,
#message {
  font-size: 1rem;
}

.send-button {
  background: #ffffff;
  border: 3px solid #00467d;
  box-shadow: 2px 2px 9px #0000009c;
  border-radius: 0.5rem;
  color: #00467d;
}

.event-text {
  font-style: italic;
}

#EmojiPicker {
  position: absolute;
  top: 0;
}
</style>

<style>
#EmojiPicker .container-emoji {
  height: 17rem;
}
</style>