<template>
  <tab-navigation :tab-contents="tabs" data-cy="manage-prices-tab" />
</template>

<script setup lang="ts">
import TabNavigation, {
  TabContent
} from '@/components/helper/TabNavigation.vue';
import { routesRef } from '@/router/routes';

const Routes = get(routesRef);

const tabs: TabContent[] = [
  Routes.PRICE_MANAGER_LATEST,
  Routes.PRICE_MANAGER_HISTORIC
];
</script>
