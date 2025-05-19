<div style="background-color: rgba(240, 249, 255, 0.75);" class="p-6 rounded-3xl shadow-md hover:shadow-lg transition transform hover:scale-105">
  <div class="text-5xl sm:text-6xl mb-4 sm:mb-6">{@html icon}</div>
  <h2 class="text-lg sm:text-xl font-semibold mb-2">{title}</h2>
  <p>{description}</p>
</div>

<script>
  export let icon;
  export let title;
  export let description;
</script>
