<template>
    <div class="d-flex ma-3">
        <!----Left Menu------->
        <div class="left-menu">
            <v-sheet class="pa-3">
                <v-text-field 
                    variant="outlined"
                    density="compact"
                    label="zip name"
                    v-model="selectedTheme.zipName"
                />
                <v-text-field 
                    variant="outlined"
                    density="compact"
                    label="author"
                    v-model="selectedTheme.author"
                />
                <div class="d-flex gap-1 justify-center">
                    <v-btn
                       @click="generateZipTheme"
                       color="primary"
                    >
                        <v-icon>mdi-download</v-icon>
                       GENERATE
                    </v-btn>
                    <!---v-btn
                       @click=""
                       color="primary"
                    >
                        <v-icon>mdi-download</v-icon>
                       Scheme
                    </!---v-btn--->
                </div>
            </v-sheet>
            <v-divider class="my-2"/>
            <!----Group Menu------->
            <v-sheet class="px-3 pt-3">
                <v-text-field 
                    v-model="keyword"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search..."
                    hide-details
                />
            </v-sheet>
            <v-list>
                <v-list-item
                    v-for="l in filteredList"
                    :key="l.label"
                    :title="l.label"
                    @click="selectedValueGroupLabel = l.label"
                ></v-list-item>
            </v-list>
        </div>
        
        <!----Center------->
        <v-sheet class="mx-2 pa-3 w-100">
            <div v-if="selectedValueGroup">
                <div class="text-h4">{{ selectedValueGroup.label }}</div>
                <div v-if="selectedValueGroup.des">
                    {{ selectedValueGroup.des }}
                </div>
                <v-divider />
                <div class="mt-3">
                    <div v-for="child in selectedValueGroup.child" >
                        <div>{{ child.label }}</div>
                        <div class="caption">
                            {{ child.des }}
                        </div>
                        <div class="d-flex">
                            <v-text-field
                                variant="outlined"
                                density="compact"
                                v-model="child.value"
                                :accept="child.format ? child.format : ''"
                            />
                            <v-menu
                                v-if="isHexColor(child.value)" 
                                :close-on-content-click="false"
                            >
                                <template v-slot:activator="{ props }">
                                    <div 
                                        class="colorPreview ml-3"
                                        v-bind="props"
                                        :style="{
                                            backgroundColor: `#${child.value}`
                                        }"
                                    >
                                    </div>
                                </template>
                                <ColorPicker v-model="child.value" />
                            </v-menu>  
                        </div>
                    </div>
                </div>
            </div>
        </v-sheet>

        <!----Right Menu------->
        <v-sheet class="pa-3">
            <ToolsPanel />
        </v-sheet>
    </div>
</template>
 
<script setup lang="ts">
// TODO: Could take time splitting the UI into smaller part.
import { selectedTheme, type MUOSThemeValues } from "@/service/theme";
import { ref, computed } from "vue";
import type { ComputedRef, Ref } from "vue";
import { generateZipTheme } from "@/service/file";
import ColorPicker from "@/components/global/ColorPicker.vue";
import ToolsPanel from "@/components/global/ToolsPanel.vue";
import { isHexColor } from "@/service/shared";

const selectedValueGroupLabel: Ref<string> = ref("");
const selectedValueGroup = computed(() => {
    if(selectedValueGroupLabel.value === "") return null;
    const foundGroup = selectedTheme.value.values.find(group => group.label === selectedValueGroupLabel.value);
    if(!foundGroup) return null;
    return foundGroup;
})

// Filtering
const keyword: Ref<string> = ref("");
const filteredList: ComputedRef<MUOSThemeValues[]> = computed(() => {
    if(!selectedTheme.value.values) return [] as MUOSThemeValues[];
    const upperKW = keyword.value.toUpperCase();
    return selectedTheme.value.values.filter(group => {
        return (
            group.label.toUpperCase().includes(upperKW) ||
            (group.des && group.des.toUpperCase().includes(upperKW)) ||
            group.child.some(child => {
                return (
                    child.label.toUpperCase().includes(upperKW) ||
                    child.des.toUpperCase().includes(upperKW)
                )
            })
        )
    })
})

 
</script>
 
<style scoped>
.left-menu{
    min-width: 250px
}
</style>