<template>
  <v-expansion-panel>
    <v-expansion-panel-header class="displayLayerHeader">
      <span>{{ value.name }}</span>
      <v-switch
        @click.native.stop
        @mousedown.native.stop
        @mouseup.native.stop
        class="toggleButton"
        v-model="visible"
        :title="`Toggle Visibility (Hotkey ${index + 1})`"
        dense
        hide-details
      />
    </v-expansion-panel-header>
    <v-expansion-panel-content :class="{ notVisible: !value.visible }">
      <v-text-field
        :value="value.name"
        @change="changeProp('name', $event)"
        label="Name"
        dense
      />
      <v-menu
        ref="colorMenu"
        v-model="showColorPicker"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="300px"
        min-width="300px"
      >
        <template #activator="{ on }">
          <v-text-field
            :value="value.color"
            @change="changeProp('color', $event)"
            label="Picker in menu"
            readonly
            dense
            v-on="on"
          >
            <template #append>
              <v-icon :color="value.color">mdi-square</v-icon>
            </template>
          </v-text-field>
        </template>
        <v-color-picker
          v-if="showColorPicker"
          :value="value.color"
          @input="changeProp('color', $event)"
          width="300"
        />
      </v-menu>
      <v-radio-group row v-model="channel" label="Channel" dense>
        <v-radio
          v-for="(channel, index) in channels"
          :key="index"
          :value="index"
          :label="channel.toString()"
        />
      </v-radio-group>
      <display-slice
        :value="value.z"
        @change="changeProp('z', $event)"
        label="Z-Slice"
        :max-value="maxZ"
      />
      <display-slice
        :value="value.time"
        @change="changeProp('time', $event)"
        label="Time-Slice"
        :max-value="maxTime"
      />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import { IDisplayLayer } from "../store/model";
import DisplaySlice from "./DisplaySlice.vue";
import store from "../store";

@Component({
  components: {
    DisplaySlice
  }
})
export default class Contrast extends Vue {
  readonly store = store;
  @Prop()
  readonly value!: IDisplayLayer;

  @Prop()
  readonly index!: number;

  showColorPicker = false;

  get channels() {
    return this.store.dataset ? this.store.dataset.channels : [];
  }

  get visible() {
    return this.value.visible;
  }

  set visible(value: boolean) {
    this.changeProp("visible", value);
  }

  get channel() {
    return this.value.channel;
  }

  set channel(value: number) {
    this.changeProp("channel", value);
  }

  get maxZ() {
    return this.store.dataset
      ? this.store.dataset.z.length
      : this.value.z.value || 0;
  }

  get maxTime() {
    return this.store.dataset
      ? this.store.dataset.time.length
      : this.value.time.value || 0;
  }

  changeProp(prop: keyof IDisplayLayer, value: any) {
    if (this.value[prop] === value) {
      return;
    }
    this.store.changeLayer({
      index: this.index,
      delta: {
        [prop]: value
      }
    });
  }
}
</script>
<style lang="scss" scoped>
.notVisible {
  opacity: 0.5;
}

.displayLayerHeader {
  > span {
    flex: 1 1 0;
  }
}

.toggleButton {
  margin: 0;
}
</style>