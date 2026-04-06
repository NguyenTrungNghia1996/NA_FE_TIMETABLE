<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="w-full space-y-1.5">
      <a-card :bordered="false" class="app-shell-card">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-base font-bold uppercase tracking-tight text-[#16697a] sm:text-lg">
              Chi Tiết Lịch Coi Thi - Môn Toán - Ngày 11/07/2026
            </p>
            <p class="mt-1 text-xs text-slate-500 sm:text-sm">
              Giao diện phân công giám thị theo tòa, tầng và từng phòng thi.
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <a-input v-model:value="search" allow-clear placeholder="Tìm theo phòng, giám thị..." class="!min-w-[240px]">
              <template #prefix>
                <Icon name="ant-design:search-outlined" size="16" class="text-slate-400" />
              </template>
            </a-input>

            <a-button type="primary" class="!bg-[#16697a] !border-[#16697a] hover:!bg-[#125564] hover:!border-[#125564]">
              <template #icon>
                <Icon name="ant-design:printer-outlined" size="16" />
              </template>
              In lịch
            </a-button>
          </div>
        </div>
      </a-card>

      <section class="grid items-start gap-1.5 xl:grid-cols-[minmax(0,1fr)_340px] pt-3">
        <div class="min-w-0">
          <a-collapse v-model:activeKey="activeBuildingKeys" :bordered="false" class="building-collapse">
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
                      <section
                        v-for="group in floor.supervisorGroups"
                        :key="group.name"
                        class="border border-slate-300 bg-[#fbfcfe]"
                      >
                        <div class="group flex items-center justify-between border-b border-slate-300 bg-[#f1f7f9] px-2.5 py-1.5 text-sm text-slate-700">
                          <div class="flex items-center gap-2">
                            <Icon name="ant-design:apartment-outlined" size="16" class="text-[#16697a]" />
                            <span class="font-semibold">GST:</span>
                            <a-typography-text>{{ group.name }}</a-typography-text>
                          </div>

                          <a-button
                            type="text"
                            danger
                            size="small"
                            class="invisible !flex !h-6 !w-6 !items-center !justify-center !p-0 opacity-0 transition group-hover:visible group-hover:opacity-100"
                          >
                            <Icon name="ant-design:delete-outlined" size="15" />
                          </a-button>
                        </div>

                        <div class="grid gap-1.5 p-1.5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                          <a-card
                            v-for="room in group.rooms"
                            :key="room.id"
                            :bordered="false"
                            class="room-card group !shadow-none transition hover:border-slate-400"
                          >
                            <div class="mb-1.5 flex items-start justify-between gap-1.5">
                              <div>
                                <a-typography-text strong class="!text-base !tracking-tight !text-slate-800">
                                  {{ room.name }}
                                </a-typography-text>
                              </div>

                              <a-button
                                type="text"
                                danger
                                size="small"
                                class="invisible !flex !h-6 !w-6 !items-center !justify-center !p-0 opacity-0 transition group-hover:visible group-hover:opacity-100"
                              >
                                <Icon name="ant-design:delete-outlined" size="15" />
                              </a-button>
                            </div>

                            <div class="space-y-1 text-sm leading-5 text-slate-700">
                              <a-card
                                v-for="person in room.invigilators"
                                :key="person.role"
                                :bordered="false"
                                size="small"
                                class="person-card"
                              >
                                <span class="font-semibold">{{ person.role }}:</span>
                                <span class="ml-1">{{ person.name }}</span>
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

        <aside class="space-y-1.5 xl:sticky xl:top-2 grid grid-cols-1 gap-1.5">
          <a-card :bordered="false" class="side-panel-card" :body-style="{ padding: '0' } ">
            <template #title>
              <span class="text-sm font-semibold text-[#16697a]">Phòng chờ</span>
            </template>
            <a-table
              size="small"
              :columns="waitingColumns"
              :data-source="waitingRoomInvigilators"
              :pagination="false"
              :row-key="record => `waiting-${record.order}`"
            />
          </a-card>

          <a-card :bordered="false" class="side-panel-card" :body-style="{ padding: '0' }">
            <template #title>
              <span class="text-sm font-semibold text-[#16697a]">Giám thị chưa xếp phòng</span>
            </template>
            <a-table
              size="small"
              :columns="unassignedColumns"
              :data-source="unassignedInvigilators"
              :pagination="false"
              :row-key="record => `unassigned-${record.order}`"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-button size="small" class="!bg-[#4b9cc9] !border-[#4b9cc9] !text-white hover:!bg-[#3f86ad] hover:!border-[#3f86ad]">
                    Chọn
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-card>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup>
const search = ref("");
const waitingRoomInvigilators = [
  { order: 1, name: "Nguyễn Văn D" },
  { order: 2, name: "Nguyễn Văn E" },
  { order: 3, name: "Nguyễn Văn F" },
];

const unassignedInvigilators = [
  { order: 1, name: "Nguyễn Văn T" },
  { order: 2, name: "Nguyễn Văn K" },
  { order: 3, name: "Nguyễn Văn Q" },
];

const waitingColumns = [
  { title: "STT", dataIndex: "order", key: "order", width: 72 },
  { title: "Họ và tên giám thị", dataIndex: "name", key: "name" },
];

const unassignedColumns = [
  { title: "STT", dataIndex: "order", key: "order", width: 72 },
  { title: "Họ và tên giám thị", dataIndex: "name", key: "name" },
  { title: "Bổ nhiệm", key: "action", width: 96 },
];

const buildings = [
  {
    id: "toa-1",
    name: "Tòa 1",
    floors: [
      makeFloor("toa-1-t1", "Tầng 1", [1, 2, 3, 4, 5], "Khối 10A", ["Nguyễn Văn C", "Lê Thu P"]),
      makeFloor("toa-1-t2", "Tầng 2", [6, 7, 8, 9, 10], "Khối 11A", ["Nguyễn Văn C", "Phạm Minh K"]),
      makeFloor("toa-1-t3", "Tầng 3", [11, 12, 13, 14, 15], "Khối 12A", ["Nguyễn Văn C", "Trần Thị H"]),
    ],
  },
  {
    id: "toa-2",
    name: "Tòa 2",
    floors: [
      makeFloor("toa-2-t1", "Tầng 1", [16, 17, 18, 19, 20], "Khối 10B", ["Nguyễn Văn C", "Đặng Văn T"]),
      makeFloor("toa-2-t2", "Tầng 2", [21, 22, 23, 24, 25], "Khối 11B", ["Nguyễn Văn C", "Ngô Thị M"]),
      makeFloor("toa-2-t3", "Tầng 3", [26, 27, 28, 29, 30], "Khối 12B", ["Nguyễn Văn C", "Hoàng Văn Q"]),
    ],
  },
];

const activeBuildingKeys = ref(buildings.map(building => building.id));
const activeFloorKeys = reactive(
  Object.fromEntries(buildings.map(building => [building.id, building.floors.map(floor => floor.id)]))
);

const filteredBuildings = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return buildings;

  return buildings
    .map(building => ({
      ...building,
      floors: building.floors
        .map(floor => ({
          ...floor,
          rooms: floor.rooms.filter(room => {
            const text = [
              room.name,
              room.supervisor,
              ...room.invigilators.map(person => `${person.role} ${person.name}`),
            ]
              .join(" ")
              .toLowerCase();

            return text.includes(keyword);
          }),
          supervisorGroups: [],
        }))
        .map(floor => ({
          ...floor,
          supervisorGroups: groupRoomsBySupervisor(floor.rooms),
        }))
        .filter(floor => floor.supervisorGroups.length > 0),
    }))
    .filter(building => building.floors.length > 0);
});

function makeFloor(id, name, roomNumbers, _examPrefix, supervisors) {
  const rooms = roomNumbers.map((number, index) => ({
    id: `${id}-room-${number}`,
    name: `Phòng ${number}`,
    supervisor: supervisors[index % supervisors.length],
    invigilators: [
      { role: "GT 1", name: "Nguyễn Văn A" },
      { role: "GT 2", name: "Nguyễn Thị B" },
    ],
  }));

  return {
    id,
    name,
    rooms,
    supervisorGroups: groupRoomsBySupervisor(rooms),
  };
}

function groupRoomsBySupervisor(rooms) {
  const groups = new Map();

  rooms.forEach(room => {
    const key = room.supervisor;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(room);
  });

  return Array.from(groups.entries()).map(([name, groupedRooms]) => ({
    name,
    rooms: groupedRooms,
  }));
}
</script>

<style scoped>
.app-shell-card,
.side-panel-card {
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
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
