<template>
  <div class="bg-white min-h-full">
    <div class="w-full space-y-1.5">
      <a-card :bordered="false" class="app-shell-card">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-base font-bold uppercase tracking-tight text-[#16697a] sm:text-lg">
              {{ title }}
            </p>
            <p v-if="subtitle" class="mt-1 text-xs text-slate-500 sm:text-sm">
              {{ subtitle }}
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <!-- <a-input-search
              v-model:value="search"
              allow-clear
              :placeholder="searchPlaceholder"
              class="!min-w-[240px]"
            ></a-input-search> -->

            <a-input-search v-model:value="search" :placeholder="searchPlaceholder" class="!min-w-[240px]"/>
            <slot name="header-actions" />
          </div>
        </div>
      </a-card>

      <a-spin :spinning="loading">
        <section class="grid items-start gap-1.5 pt-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <aside class="grid grid-cols-1 gap-1.5 xl:hidden">
            <a-card :bordered="false" class="side-panel-card" :body-style="{ padding: '0' }">
              <template #title>
                <span class="text-sm font-semibold text-[#16697a]">Phòng chờ</span>
              </template>
              <a-table size="small" :columns="sideColumns" :data-source="filteredWaitingList" :pagination="false" :scroll="{ y: sideTableScrollY }" :row-key="record => `mobile-waiting-${record.id || record.order}`" />
            </a-card>

            <a-card :bordered="false" class="side-panel-card" :body-style="{ padding: '0' }">
              <template #title>
                <span class="text-sm font-semibold text-[#16697a]">Giám thị chưa xếp phòng</span>
              </template>
              <a-table size="small" :columns="unassignedColumns" :data-source="filteredUnassignedList" :pagination="false" :scroll="{ y: sideTableScrollY }" :row-key="record => `mobile-unassigned-${record.id || record.order}`">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'action'">
                    <a-button size="small" class="!bg-[#4b9cc9] !border-[#4b9cc9] !text-white hover:!bg-[#3f86ad] hover:!border-[#3f86ad]" :loading="drawingTeacherId === record.id" :disabled="!showDrawAction || disableDrawActions" @click="emit('draw-unassigned', record)"> Bốc </a-button>
                  </template>
                </template>
              </a-table>
            </a-card>
          </aside>

          <div class="min-w-0">
            <div v-if="!filteredBuildings.length && !loading" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Không có dữ liệu phân công phù hợp.</div>

            <a-collapse v-else v-model:activeKey="activeBuildingKeys" :bordered="false" class="building-collapse">
              <a-collapse-panel v-for="building in filteredBuildings" :key="building.id">
                <template #header>
                  <div class="flex items-center gap-3">
                    <a-tag color="#dbecef" class="!m-0 !flex !h-9 !w-9 !items-center !justify-center !border !border-slate-300 !bg-[#dbecef] !text-[#16697a]">
                      <Icon name="ant-design:bank-outlined" size="20" />
                    </a-tag>
                    <a-typography-text strong class="!text-base !text-[#16697a]">{{ building.name }}</a-typography-text>
                  </div>
                </template>

                <a-collapse v-model:activeKey="activeFloorKeys[building.id]" :bordered="false" class="floor-collapse">
                  <a-collapse-panel v-for="floor in building.floors" :key="floor.id">
                    <template #header>
                      <div class="flex items-center gap-3">
                        <a-tag color="#dbecef" class="!m-0 !flex !h-8 !items-center !border !border-slate-300 !bg-[#dbecef] !px-3 !text-sm !font-semibold !text-[#16697a]">
                          {{ floor.name }}
                        </a-tag>
                      </div>
                    </template>

                    <div class="p-1.5 sm:p-2">
                      <div class="space-y-1.5">
                        <section v-for="group in floor.supervisorGroups" :key="group.id" class="border border-slate-300 bg-[#fbfcfe]">
                          <div class="group-header flex items-center justify-between border-b border-slate-300 bg-[#f1f7f9] px-2.5 py-1.5 text-sm text-slate-700">
                            <div class="flex items-center gap-2">
                              <Icon name="ant-design:apartment-outlined" size="16" class="text-[#16697a]" />
                              <span class="font-semibold">GST:</span>
                              <a-typography-text>{{ group.name }}</a-typography-text>
                            </div>

                            <a-popconfirm v-if="showResetActions && group.supervisorId" title="Hủy kết quả giám sát này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="emit('reset-supervisor', group)">
                              <a-button class="delete-action" type="text" danger size="small" :loading="resettingSupervisorId === group.supervisorId" :disabled="disableResetActions">
                                <template #icon>
                                  <Icon name="ant-design:delete-outlined" size="15" />
                                </template>
                              </a-button>
                            </a-popconfirm>
                          </div>

                          <div class="grid gap-1.5 p-1.5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                            <a-card v-for="room in group.rooms" :key="room.id" :bordered="false" class="room-card !shadow-none transition hover:border-slate-400">
                              <div class="room-header mb-1.5 flex items-start justify-between gap-1.5">
                                <div>
                                  <a-typography-text strong class="!text-base !tracking-tight !text-slate-800">
                                    {{ room.name }}
                                  </a-typography-text>
                                </div>

                                <a-popconfirm v-if="showResetActions && room.roomId" title="Hủy kết quả phòng này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="emit('reset-room', room)">
                                  <a-button class="delete-action" type="text" danger size="small" :loading="resettingRoomId === room.roomId" :disabled="disableResetActions">
                                    <template #icon>
                                      <Icon name="ant-design:delete-outlined" size="15" />
                                    </template>
                                  </a-button>
                                </a-popconfirm>
                              </div>

                              <div class="space-y-1 text-sm leading-5 text-slate-700">
                                <a-card v-for="person in room.invigilators" :key="person.role" :bordered="false" size="small" class="person-card">
                                  <span class="font-semibold">{{ person.role }}:</span>
                                  <span class="ml-1">{{ person.name || "Chưa gán" }}</span>
                                </a-card>
                              </div>
                            </a-card>
                          </div>
                        </section>
                      </div>
                    </div>
                  </a-collapse-panel>
                </a-collapse>
              </a-collapse-panel>
            </a-collapse>
          </div>

          <aside class="hidden grid-cols-1 gap-1.5 space-y-1.5 xl:grid xl:sticky xl:top-2">
            <a-card :bordered="false" class="side-panel-card side-panel-fixed" :body-style="{ padding: '0' }">
              <template #title>
                <span class="text-sm font-semibold text-[#16697a]">Phòng chờ</span>
              </template>
              <a-table size="small" :columns="sideColumns" :data-source="filteredWaitingList" :pagination="false" :scroll="{ y: sideTableScrollY }" :row-key="record => `waiting-${record.id || record.order}`" />
            </a-card>

            <a-card :bordered="false" class="side-panel-card side-panel-fixed" :body-style="{ padding: '0' }">
              <template #title>
                <span class="text-sm font-semibold text-[#16697a]">Giám thị chưa xếp phòng</span>
              </template>
              <a-table size="small" :columns="unassignedColumns" :data-source="filteredUnassignedList" :pagination="false" :scroll="{ y: sideTableScrollY }" :row-key="record => `unassigned-${record.id || record.order}`">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'action'">
                    <a-button size="small" class="!bg-[#4b9cc9] !border-[#4b9cc9] !text-white hover:!bg-[#3f86ad] hover:!border-[#3f86ad]" :loading="drawingTeacherId === record.id" :disabled="!showDrawAction || disableDrawActions" @click="emit('draw-unassigned', record)"> Bốc </a-button>
                  </template>
                </template>
              </a-table>
            </a-card>
          </aside>
        </section>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "Chi tiết lịch coi thi",
  },
  subtitle: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  buildings: {
    type: Array,
    default: () => [],
  },
  waitingList: {
    type: Array,
    default: () => [],
  },
  unassignedList: {
    type: Array,
    default: () => [],
  },
  searchPlaceholder: {
    type: String,
    default: "Tìm theo phòng, giám thị...",
  },
  showResetActions: {
    type: Boolean,
    default: false,
  },
  disableResetActions: {
    type: Boolean,
    default: false,
  },
  resettingSupervisorId: {
    type: [Number, String],
    default: null,
  },
  resettingRoomId: {
    type: [Number, String],
    default: null,
  },
  showDrawAction: {
    type: Boolean,
    default: false,
  },
  disableDrawActions: {
    type: Boolean,
    default: false,
  },
  drawingTeacherId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["reset-supervisor", "reset-room", "draw-unassigned"]);

const search = ref("");
const activeBuildingKeys = ref([]);
const activeFloorKeys = reactive({});
const sideTableScrollY = "calc(50vh - 96px)";

const sideColumns = [
  { title: "STT", dataIndex: "order", key: "order", width: 72 },
  { title: "Họ và tên giám thị", dataIndex: "name", key: "name" },
];

const unassignedColumns = computed(() => {
  const columns = [...sideColumns];
  if (props.showDrawAction) {
    columns.push({ title: "Bốc thăm", key: "action", width: 96, align: "center" });
  }
  return columns;
});

const filteredWaitingList = computed(() => filterSideList(props.waitingList, search.value));
const filteredUnassignedList = computed(() => filterSideList(props.unassignedList, search.value));

const filteredBuildings = computed(() => {
  const keyword = normalizeText(search.value);
  if (!keyword) return props.buildings;

  return props.buildings
    .map(building => ({
      ...building,
      buildingMatches: normalizeText(building.name).includes(keyword),
    }))
    .map(building => ({
      ...building,
      floors: (building.floors || [])
        .map(floor => ({
          ...floor,
          floorMatches: building.buildingMatches || normalizeText(floor.name).includes(keyword),
        }))
        .map(floor => ({
          ...floor,
          supervisorGroups: (floor.supervisorGroups || [])
            .map(group => ({
              ...group,
              groupMatches: floor.floorMatches || normalizeText(group.name).includes(keyword),
            }))
            .map(group => ({
              ...group,
              rooms: group.groupMatches
                ? group.rooms || []
                : (group.rooms || []).filter(room => {
                    const haystack = normalizeText([building.name, floor.name, group.name, room.name, ...(room.invigilators || []).map(person => `${person.role} ${person.name || ""}`)].join(" "));

                    return haystack.includes(keyword);
                  }),
            }))
            .filter(group => group.rooms.length > 0),
        }))
        .filter(floor => floor.supervisorGroups.length > 0),
    }))
    .filter(building => building.floors.length > 0);
});

watch(
  () => props.buildings,
  buildings => {
    const nextKeys = [];
    const nextFloorKeys = {};

    (buildings || []).forEach(building => {
      nextKeys.push(building.id);
      nextFloorKeys[building.id] = (building.floors || []).map(floor => floor.id);
    });

    activeBuildingKeys.value = nextKeys;

    Object.keys(activeFloorKeys).forEach(key => {
      delete activeFloorKeys[key];
    });

    Object.assign(activeFloorKeys, nextFloorKeys);
  },
  { immediate: true, deep: true },
);

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function filterSideList(items, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return items;

  return (items || []).filter(item => {
    const haystack = normalizeText(`${item.order} ${item.code || ""} ${item.name || ""}`);
    return haystack.includes(normalizedKeyword);
  });
}
</script>

<style scoped>
.app-shell-card,
.side-panel-card {
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

.side-panel-fixed {
  max-height: calc(50vh - 24px);
  overflow: hidden;
}

:deep(.app-shell-card .ant-card-body) {
  padding: 10px 14px;
}

:deep(.side-panel-card .ant-card-head) {
  min-height: 36px;
  border-bottom: 1px solid #cbd5e1;
  background: #e8f3f7;
  padding: 0 10px;
}

:deep(.side-panel-card .ant-card-head-title) {
  padding: 8px 0;
}

:deep(.side-panel-card .ant-table) {
  font-size: 13px;
}

:deep(.side-panel-card .ant-spin-nested-loading),
:deep(.side-panel-card .ant-spin-container),
:deep(.side-panel-card .ant-table-wrapper) {
  height: 100%;
}

:deep(.side-panel-card .ant-table-thead > tr > th) {
  background: #f4f8fb;
  color: #475569;
  font-weight: 600;
  padding: 8px 10px !important;
}

:deep(.side-panel-card .ant-table-tbody > tr > td),
:deep(.side-panel-card .ant-table-thead > tr > th) {
  border-color: #e2e8f0 !important;
}

:deep(.side-panel-card .ant-table-tbody > tr > td) {
  padding: 8px 10px !important;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 0;
  border-color: #cbd5e1;
  background: #f8fafc;
  padding: 6px 10px;
}

.room-card {
  border: 1px solid #cbd5e1;
  background: linear-gradient(180deg, #ffffff 0%, #fcfeff 100%);
}

:deep(.room-card > .ant-card-body) {
  padding: 10px;
}

.person-card {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

:deep(.delete-action) {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.group-header:hover :deep(.delete-action),
.room-header:hover :deep(.delete-action),
:deep(.delete-action.ant-btn-loading) {
  opacity: 1;
  pointer-events: auto;
}

:deep(.person-card > .ant-card-body) {
  padding: 6px 8px;
}

:deep(.building-collapse),
:deep(.floor-collapse) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.building-collapse > .ant-collapse-item),
:deep(.floor-collapse > .ant-collapse-item) {
  border: 1px solid #cbd5e1;
  background: #ffffff;
}

:deep(.building-collapse > .ant-collapse-item) {
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
}

:deep(.floor-collapse > .ant-collapse-item) {
  background: #fbfcfe;
}

:deep(.building-collapse > .ant-collapse-item > .ant-collapse-header) {
  border-bottom: 1px solid #cbd5e1;
  background: #f3f7f8;
  align-items: center;
  padding: 10px 14px !important;
}

:deep(.floor-collapse > .ant-collapse-item > .ant-collapse-header) {
  border-bottom: 1px dashed #cbd5e1;
  align-items: center;
  padding: 8px 10px !important;
}

:deep(.building-collapse > .ant-collapse-item > .ant-collapse-content),
:deep(.floor-collapse > .ant-collapse-item > .ant-collapse-content) {
  border-top: 0;
}

:deep(.building-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box) {
  padding: 6px 8px 8px !important;
}

:deep(.floor-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box) {
  padding: 0 !important;
}
</style>
