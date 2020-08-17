<template>
  <v-app class="leaderboards" :dark="$vuetify.theme.dark">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>{{
        !routeCategory && !routeSubCategory
          ? "Global leaderboards"
          : `${routeCategory || ""} ${routeSubCategory || ""} leaderboards`
      }}</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <div v-if="!routeCategory && !routeSubCategory" class="categoryLinks">
        <router-link
          v-for="category in Object.keys(categories)"
          :to="`/leaderboards/${category}`"
          :key="category"
          class="categoryLink"
          >{{ category }}</router-link
        >
      </div>
      <div v-else class="categoryLinks">
        <router-link
          v-for="subCategory in categories[routeCategory]"
          :to="`/leaderboards/${routeCategory}/${subCategory}`"
          :key="subCategory"
          class="categoryLink"
          >{{ subCategory }}</router-link
        >
      </div>
      <v-data-table
        :headers="headers"
        :items="leaderboardData"
        :loading="loading"
        class="dataTable"
        show-expand
        :expanded.sync="expanded"
      >
        <template v-slot:item.category="{ item }">
          {{ item.category }} {{ item.subCategory }}
        </template>
        <template v-slot:item.date="{ item }">
          {{ displayDate(Number(item.date)) }}
        </template>
        <template v-slot:item.username="{ item }">
          <router-link :to="`user/${item.username}`" v-if="item.userHasAccount">
            <p style="margin: auto">{{ item.username }}</p>
          </router-link>
          <p v-else>{{ item.username }}</p>
        </template>
        <template v-slot:item.time="{ item }">
          <strong>{{
            item.subCategory === "fmc" ? item.time : millisToTime(item.time)
          }}</strong>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            Evidence url: <a :href="item.evidence">{{ item.evidence }}</a>
            <p style="margin: 0" v-if="item.notes">Notes: {{ item.notes }}</p>
          </td>
        </template>
      </v-data-table>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
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
  expanded = [];
  loading = true;
  categories = categories;
  routeCategory = this.$route.params.category ?? null;
  routeSubCategory = this.$route.params.subCategory ?? null;
  headers = [
    { text: "Category", value: "category" },
    { text: "Date", value: "date" },
    { text: this.movesVsTime, value: "time" },
    { text: "Username", value: "username" },
    { text: "", value: "data-table-expand" }
  ];
  leaderboardData: Score<Category>[] = [];
  async getData() {
    return (
      await fetch(
        `${apiUrl}leaderboards${
          this.routeCategory ? `/${this.routeCategory}` : ""
        }${this.routeSubCategory ? `/${this.routeSubCategory}` : ""}`
      )
    ).json();
  }
  get movesVsTime() {
    return this.routeSubCategory === "fmc" ? "Moves" : "Time";
  }
  async mounted() {
    this.leaderboardData = await this.getData();
    this.loading = false;
  }
  displayDate(date: number) {
    const leDate = new Date(date);
    const year = leDate.getUTCFullYear();
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      leDate
    );
    const day = leDate.getUTCDate();
    return `${year}-${month}-${day}`;
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
  @Watch("$route.params.category")
  async categoryChanged(category: string) {
    this.loading = true;
    this.routeCategory = category;
    this.leaderboardData = await this.getData();
    this.loading = false;
    this.headers[2].text = this.movesVsTime;
  }
  @Watch("$route.params.subCategory")
  async subCategoryChanged(subCategory: string) {
    this.loading = true;
    this.routeSubCategory = subCategory;
    this.leaderboardData = await this.getData();
    this.loading = false;
    this.headers[2].text = this.movesVsTime;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~vuetify/src/styles/main.sass";
.categoryLink {
  display: inline-block;
  padding: 5px;
}
.topBar {
  background-color: var(--v-primary-darken4);
  color: #ddd;
  padding: 5px;
  width: 100%;
  text-align: center;
}
.categoryLinks {
  text-align: center;
  width: 100%;
  padding-top: 1%;
  padding-bottom: 1%;
}
.dataTable {
  width: 90%;
  margin: auto;
}
</style>
