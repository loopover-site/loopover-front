<template>
  <v-app>
    <v-main>
      <v-snackbar v-model="submitted">
        {{ submittedText }}
        <v-btn color="primary" text @click="submitted = false">
          Close
        </v-btn>
      </v-snackbar>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Submit</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form ref="submitForm">
                  <v-select
                    v-model="category"
                    :items="Object.keys(categories)"
                    label="Category"
                    required
                  ></v-select>

                  <v-select
                    v-model="subCategory"
                    :items="categories[category]"
                    label="Subcategory"
                    required
                  ></v-select>

                  <v-text-field
                    label="Time"
                    name="time"
                    prepend-icon="mdi-clock"
                    type="text"
                    v-model="time"
                    :rules="[
                      v => !!v || 'Your time is required',
                      v =>
                        timeValidated(v) || 'You have to provide a valid time!'
                    ]"
                    required
                  ></v-text-field>

                  <v-text-field
                    id="evidence"
                    label="Evidence URL"
                    name="evidenceUrl"
                    prepend-icon="mdi-link"
                    type="text"
                    v-model="evidenceUrl"
                    :rules="[v => !!v || 'An evidence URL is required']"
                    required
                  ></v-text-field>

                  <v-text-field
                    id="customusername"
                    label="Custom username"
                    name="customUsername"
                    prepend-icon="mdi-account"
                    type="text"
                    v-model="customUsername"
                    v-if="!loggedIn"
                    :rules="[v => !!v || 'A custom username is required']"
                    required
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="submit()" color="primary">Submit</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import apiUrl from "../store/apiUrl";
import { categories } from "@/store/category";

@Component
export default class Submit extends Vue {
  loggedIn = false;
  category = "5x5";
  subCategory = "regular";
  time = "";
  evidenceUrl = "";
  customUsername = "";
  categories = categories;
  submitted = false;
  submittedText = "";
  async mounted() {
    this.loggedIn = (
      await (
        await fetch(`${apiUrl}users/loggedIn`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          redirect: "follow",
          referrerPolicy: "no-referrer"
        })
      ).json()
    ).loggedIn;
  }
  async submit() {
    const validated = (this.$refs.submitForm as Vue & {
      validate: () => boolean;
    }).validate();
    if (!validated) {
      this.submitted = true;
      this.submittedText = "You need to ensure all fields are validated!";
      return;
    }
    const resp = await (
      await fetch(`${apiUrl}leaderboards/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category: this.category,
          subCategory: this.subCategory,
          time: this.timeToMillis(this.time),
          evidence: this.evidenceUrl,
          username: this.customUsername
        }),
        redirect: "follow",
        referrerPolicy: "no-referrer"
      })
    ).json();
    this.submitted = true;
    this.submittedText = resp.message;
  }
  timeValidated(time: string) {
    return /([0-5]?\d:)?[0-5]?\d.\d\d\d/g.test(time);
  }
  timeToMillis(time: string) {
    const splitMinutes = time.split(":");
    const splitSeconds = splitMinutes.flatMap(l => l.split("."));
    const millis = Number(
      splitSeconds.length > 0 ? splitSeconds[splitSeconds.length - 1] : 0
    );
    const seconds = Number(
      splitSeconds.length > 1 ? splitSeconds[splitSeconds.length - 2] : 0
    );
    const minutes = Number(
      splitSeconds.length > 2 ? splitSeconds[splitSeconds.length - 3] : 0
    );
    return minutes * 60000 + seconds * 1000 + millis;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
