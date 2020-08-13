<template>
  <v-app class="leaderboards">
    <v-data-table :headers="headers" :items="leaderboardData">
      <template v-slot:item.date="{ item }">
        {{ new Date(Number(item.date)).toISOString().split("T")[0] }}
      </template>
      <template v-slot:item.evidence="{ item }">
        <a :href="item.evidence">{{ item.evidence }}</a>
      </template>
      <template v-slot:item.username="{ item }">
        <router-link :to="`user/${item.username}`" v-if="item.userHasAccount">
          <p>{{ item.username }}</p>
        </router-link>
        <p v-else>{{ item.username }}</p>
      </template>
      <template v-slot:item.time="{ item }">
        {{ millisToTime(item.time) }}
      </template>
    </v-data-table>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import apiUrl from "@/store/apiUrl";
import { categories, Category } from "@/store/category";

type ValueOf<T> = T[keyof T];

interface Score<T extends Category> {
  id: number;
  category: T;
  subCategory: ValueOf<typeof categories[T]>;
  date: number;
  time: number;
  evidence: string;
  userHasAccount: boolean;
  username: string;
}

@Component
export default class Leaderboards extends Vue {
  headers = [
    { text: "Category", value: "category" },
    { text: "Subcategory", value: "subCategory" },
    { text: "Date", value: "date" },
    { text: "Time", value: "time" },
    { text: "Evidence", value: "evidence" },
    { text: "Username", value: "username" }
  ];
  leaderboardData: Score<Category>[] = [];
  async getData() {
    return (await fetch(`${apiUrl}leaderboards`)).json();
  }
  async mounted() {
    const data = await this.getData();
    console.log(data);
    this.leaderboardData = data;
  }
  millisToTime(milliseconds: number) {
    const currentDate = new Date(milliseconds);
    const hours = `${currentDate.getUTCHours()}`;
    const minutes =
      hours === "0"
        ? `${currentDate.getUTCMinutes()}`.slice(-1)
        : `0${currentDate.getUTCMinutes()}`.slice(-2);
    const seconds = `0${currentDate.getUTCSeconds()}`.slice(-2);
    const millis = `00${currentDate.getUTCMilliseconds()}`.slice(-3);

    return `${hours === "0" ? "" : `${hours}:`}${
      minutes === "00" || (minutes === "0" && hours === "0")
        ? ""
        : `${minutes}:`
    }${seconds}.${millis}`;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
