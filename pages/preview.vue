<template>
  <ExamScheduleAssignmentBoard
    title="Chi Tiết Lịch Coi Thi - Môn Toán - Ngày 11/07/2026"
    subtitle="Giao diện phân công giám thị theo tòa, tầng và từng phòng thi."
    :buildings="buildings"
    :waiting-list="waitingRoomInvigilators"
    :unassigned-list="unassignedInvigilators"
  >
    <template #header-actions>
      <a-button type="primary" class="!bg-[#16697a] !border-[#16697a] hover:!bg-[#125564] hover:!border-[#125564]">
        <template #icon>
          <Icon name="ant-design:printer-outlined" size="16" />
        </template>
        In lịch
      </a-button>
    </template>
  </ExamScheduleAssignmentBoard>
</template>

<script setup>
const waitingRoomInvigilators = [
  { order: 1, id: 1, code: "GV-0001", name: "Nguyễn Văn D" },
  { order: 2, id: 2, code: "GV-0002", name: "Nguyễn Văn E" },
  { order: 3, id: 3, code: "GV-0003", name: "Nguyễn Văn F" },
];

const unassignedInvigilators = [
  { order: 1, id: 4, code: "GV-0004", name: "Nguyễn Văn T" },
  { order: 2, id: 5, code: "GV-0005", name: "Nguyễn Văn K" },
  { order: 3, id: 6, code: "GV-0006", name: "Nguyễn Văn Q" },
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

function makeFloor(id, name, roomNumbers, _examPrefix, supervisors) {
  return {
    id,
    name,
    supervisorGroups: groupRoomsBySupervisor(
      roomNumbers.map((number, index) => ({
        id: `${id}-room-${number}`,
        name: `Phòng ${number}`,
        supervisor: supervisors[index % supervisors.length],
        invigilators: [
          { role: "GT 1", name: "Nguyễn Văn A" },
          { role: "GT 2", name: "Nguyễn Thị B" },
        ],
      })),
    ),
  };
}

function groupRoomsBySupervisor(rooms) {
  const groups = new Map();

  rooms.forEach(room => {
    const key = room.supervisor;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      id: room.id,
      name: room.name,
      invigilators: room.invigilators,
    });
  });

  return Array.from(groups.entries()).map(([name, groupedRooms], index) => ({
    id: `${name}-${index}`,
    name,
    rooms: groupedRooms,
  }));
}
</script>
