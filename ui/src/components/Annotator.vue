<template>
    <v-container>
      <v-btn color="primary" @click="onUploadClick">Upload File</v-btn>
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  // Define ref for the file input element
  const fileInput = ref<HTMLInputElement | null>(null);
  
  // Function to simulate clicking the hidden file input when the button is clicked
  function onUploadClick() {
    fileInput.value?.click();
  }
  
  // Handle the file selection event
  function handleFileUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      readAsText(file);
    }
  }
  
  // Read the file as text and log its content to the console
  function readAsText(file: File) {
    const reader = new FileReader();
    reader.onload = () => console.log(reader.result); // Log the file content to the console
    reader.readAsText(file); // Convert the file to text
  }
  
  </script>
  
  <style scoped lang="sass">
  // Your styles (if any) go here
  </style>
  