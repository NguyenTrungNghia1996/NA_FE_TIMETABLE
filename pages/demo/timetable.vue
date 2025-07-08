<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">Demo xếp thời khóa biểu liên kết</h1>
    <a-select
      v-model:value="selectedTeacher"
      :options="teacherOptions"
      class="mb-4 w-48"
    />
    <div class="grid gap-6 md:grid-cols-2">
      <a-card>
        <template #title>Thời khóa biểu lớp 6A</template>
      <div class="overflow-x-auto">
        <table class="min-w-full text-center border-collapse table-fixed">
          <tbody>
            <tr>
              <th colspan="6" class="bg-gray-50 text-left px-2">Ca sáng</th>
            </tr>
            <tr>
              <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
              <th
                v-for="day in days"
                :key="`morning-${day}`"
                class="border p-2 w-32 h-12"
              >
                {{ day }}
              </th>
            </tr>
            <tr
              v-for="(row, rIndex) in timetables['6A'].morning"
              :key="`morning-${rIndex}`"
            >
              <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
              <td
                v-for="(lesson, cIndex) in row"
                :key="cIndex"
                class="border p-2 w-32 h-12 select-none overflow-hidden"
                :class="[
                  !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                  { 'bg-blue-100': isSelected('6A', rIndex, cIndex) },
                  { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                  { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                  { 'bg-green-100': isValidTarget('6A', rIndex, cIndex) }
                ]"
                :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
                @dragstart="onDragStart('6A', rIndex, cIndex)"
                @click="startHighlight('6A', rIndex, cIndex)"
                @dragover.prevent
                @drop="onDrop('6A', rIndex, cIndex)"
                @contextmenu.prevent="openMenu($event, '6A', rIndex, cIndex)"
              >
                <template v-if="lesson.subject">
                  <div class="line-clamp-1">
                    {{ lesson.subject }} - {{ lesson.class }}
                  </div>
                  <div class="text-xs line-clamp-1">
                    {{ lesson.teacher }}
                  </div>
                </template>
                <template v-else-if="lesson.isBreak">Nghỉ</template>
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th colspan="6" class="bg-gray-50 text-left px-2">Ca chiều</th>
            </tr>
            <tr>
              <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
              <th
                v-for="day in days"
                :key="`afternoon-${day}`"
                class="border p-2 w-32 h-12"
              >
                {{ day }}
              </th>
            </tr>
            <tr
              v-for="(row, rIndex) in timetables['6A'].afternoon"
              :key="`afternoon-${rIndex}`"
            >
              <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
              <td
                v-for="(lesson, cIndex) in row"
                :key="cIndex"
                class="border p-2 w-32 h-12 select-none overflow-hidden"
                :class="[
                  !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                  { 'bg-blue-100': isSelected('6A', rIndex + 5, cIndex) },
                  { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                  { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                  { 'bg-green-100': isValidTarget('6A', rIndex + 5, cIndex) }
                ]"
                :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
                @dragstart="onDragStart('6A', rIndex + 5, cIndex)"
                @click="startHighlight('6A', rIndex + 5, cIndex)"
                @dragover.prevent
                @drop="onDrop('6A', rIndex + 5, cIndex)"
                @contextmenu.prevent="openMenu($event, '6A', rIndex + 5, cIndex)"
              >
                <template v-if="lesson.subject">
                  <div class="line-clamp-1">
                    {{ lesson.subject }} - {{ lesson.class }}
                  </div>
                  <div class="text-xs line-clamp-1">
                    {{ lesson.teacher }}
                  </div>
                </template>
                <template v-else-if="lesson.isBreak">Nghỉ</template>
              </td>
            </tr>
          </tbody>
        </table>
  </div>
    </a-card>

    <a-card class="mb-6">
      <template #title>Thời khóa biểu lớp 6B</template>
      <div class="overflow-x-auto">
        <table class="min-w-full text-center border-collapse table-fixed">
          <tbody>
            <tr>
              <th colspan="6" class="bg-gray-50 text-left px-2">Ca sáng</th>
            </tr>
            <tr>
              <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
              <th
                v-for="day in days"
                :key="`morning-6B-${day}`"
                class="border p-2 w-32 h-12"
              >
                {{ day }}
              </th>
            </tr>
            <tr
              v-for="(row, rIndex) in timetables['6B'].morning"
              :key="`6B-morning-${rIndex}`"
            >
              <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
              <td
                v-for="(lesson, cIndex) in row"
                :key="cIndex"
                class="border p-2 w-32 h-12 select-none overflow-hidden"
                :class="[
                  !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                  { 'bg-blue-100': isSelected('6B', rIndex, cIndex) },
                  { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                  { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                  { 'bg-green-100': isValidTarget('6B', rIndex, cIndex) }
                ]"
                :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
                @dragstart="onDragStart('6B', rIndex, cIndex)"
                @click="startHighlight('6B', rIndex, cIndex)"
                @dragover.prevent
                @drop="onDrop('6B', rIndex, cIndex)"
                @contextmenu.prevent="openMenu($event, '6B', rIndex, cIndex)"
              >
                <template v-if="lesson.subject">
                  <div class="line-clamp-1">
                    {{ lesson.subject }} - {{ lesson.class }}
                  </div>
                  <div class="text-xs line-clamp-1">
                    {{ lesson.teacher }}
                  </div>
                </template>
                <template v-else-if="lesson.isBreak">Nghỉ</template>
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th colspan="6" class="bg-gray-50 text-left px-2">Ca chiều</th>
            </tr>
            <tr>
              <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
              <th
                v-for="day in days"
                :key="`afternoon-6B-${day}`"
                class="border p-2 w-32 h-12"
              >
                {{ day }}
              </th>
            </tr>
            <tr
              v-for="(row, rIndex) in timetables['6B'].afternoon"
              :key="`6B-afternoon-${rIndex}`"
            >
              <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
              <td
                v-for="(lesson, cIndex) in row"
                :key="cIndex"
                class="border p-2 w-32 h-12 select-none overflow-hidden"
                :class="[
                  !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                  { 'bg-blue-100': isSelected('6B', rIndex + 5, cIndex) },
                  { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                  { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                  { 'bg-green-100': isValidTarget('6B', rIndex + 5, cIndex) }
                ]"
                :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
                @dragstart="onDragStart('6B', rIndex + 5, cIndex)"
                @click="startHighlight('6B', rIndex + 5, cIndex)"
                @dragover.prevent
                @drop="onDrop('6B', rIndex + 5, cIndex)"
                @contextmenu.prevent="openMenu($event, '6B', rIndex + 5, cIndex)"
              >
                <template v-if="lesson.subject">
                  <div class="line-clamp-1">
                    {{ lesson.subject }} - {{ lesson.class }}
                  </div>
                  <div class="text-xs line-clamp-1">
                    {{ lesson.teacher }}
                  </div>
                </template>
                <template v-else-if="lesson.isBreak">Nghỉ</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>
    </div>

    <div v-if="contextMenu.show" class="fixed bg-white border rounded shadow z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="toggleBreak(contextMenu.cls, contextMenu.row, contextMenu.col)">
          {{ getCell(contextMenu.cls, contextMenu.row, contextMenu.col).isBreak ? 'Bỏ nghỉ' : 'Đặt nghỉ' }}
        </li>
      </ul>
    </div>

    <div class="mt-10 border-t pt-6">
      <h2 class="text-xl font-bold mb-4">📓 Hướng dẫn sử dụng</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Nhấn chuột phải để đặt hoặc bỏ nghỉ.</li>
        <li>Kéo thả các tiết để hoán đổi vị trí.</li>
        <li>Không thể kéo thả vào tiết nghỉ.</li>
        <li>Không thể đặt nghỉ ở ô đã có tiết học.</li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{
        JSON.stringify(timetables, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup>

const teacherName = 'PT Thoản'
const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']

// lịch cơ bản của giáo viên (không bao gồm lớp 6A)
const teacherBusyMorning = [
  [
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' },
    { class: '7C', subject: 'AN' },
    { class: '8C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '6B', subject: 'AN' },
    { class: '9C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '8A', subject: 'AN' }
  ],
  [
    { class: '9A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '7A', subject: 'AN' },
    { class: '8B', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '9B', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '9A', subject: 'AN' }
  ],
  [
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8B', subject: 'AN' },
    { class: '8A', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '7C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '6B', subject: 'AN' },
    { class: '7A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' }
  ],
]

const teacherBusyAfternoon = [
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8B', subject: 'AN' },
    { class: '8A', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '7C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '6B', subject: 'AN' },
    { class: '7A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8A', subject: 'AN' }
  ]
]

// thời khóa biểu các lớp tách thành 2 ca (mỗi ca 5 tiết)
const timetables = reactive({
  '6A': {
    morning: [
      [
        { id: 1, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 2, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 3, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false },
        { id: 4, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 5, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false }
      ],
      [
        { id: 6, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 7, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 8, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false },
        { id: 9, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
        { id: 10, subject: 'Sử', class: '6A', teacher: 'Lê Văn Quý', isBreak: false }
      ],
      [
        { id: 11, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 12, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 13, subject: '', class: '', teacher: '', isBreak: true },
        { id: 14, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false },
        { id: 15, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false }
      ],
      [
        { id: 16, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 17, subject: 'Mỹ thuật', class: '6A', teacher: 'Đỗ Lan Hương', isBreak: false },
        { id: 18, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 19, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 20, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false }
      ],
      [
        { id: 21, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 22, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
        { id: 23, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 24, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false },
        { id: 25, subject: 'Sử', class: '6A', teacher: 'Lê Văn Quý', isBreak: false }
      ]
    ],
    afternoon: [
      [
        { id: 26, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 27, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false },
        { id: 28, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 29, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 30, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false }
      ],
      [
        { id: 31, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 32, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 33, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
        { id: 34, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 35, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false }
      ],
      [
        { id: 36, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 37, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 38, subject: '', class: '', teacher: '', isBreak: true },
        { id: 39, subject: 'Mỹ thuật', class: '6A', teacher: 'Đỗ Lan Hương', isBreak: false },
        { id: 40, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false }
      ],
      [
        { id: 41, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false },
        { id: 42, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 43, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 44, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 45, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false }
      ],
      [
        { id: 46, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 47, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
        { id: 48, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 49, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 50, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false }
      ]
    ]
  },
  '6B': {
    morning: [
      [
        { id: 1, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 2, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 3, subject: 'Anh', class: '6B', teacher: 'Trần Thu Hà', isBreak: false },
        { id: 4, subject: 'Lý', class: '6B', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 5, subject: 'Âm nhạc', class: '6B', teacher: teacherName, isBreak: false }
      ],
      [
        { id: 6, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 7, subject: 'Địa', class: '6B', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 8, subject: 'Sinh', class: '6B', teacher: 'Nguyễn Thị Minh', isBreak: false },
        { id: 9, subject: 'Âm nhạc', class: '6B', teacher: teacherName, isBreak: false },
        { id: 10, subject: 'Sử', class: '6B', teacher: 'Lê Văn Quý', isBreak: false }
      ],
      [
        { id: 11, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 12, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 13, subject: '', class: '', teacher: '', isBreak: true },
        { id: 14, subject: 'Công nghệ', class: '6B', teacher: 'Phạm Văn Khang', isBreak: false },
        { id: 15, subject: 'Anh', class: '6B', teacher: 'Trần Thu Hà', isBreak: false }
      ],
      [
        { id: 16, subject: 'Tin học', class: '6B', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 17, subject: 'Mỹ thuật', class: '6B', teacher: 'Đỗ Lan Hương', isBreak: false },
        { id: 18, subject: 'Thể dục', class: '6B', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 19, subject: 'Địa', class: '6B', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 20, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false }
      ],
      [
        { id: 21, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 22, subject: 'Âm nhạc', class: '6B', teacher: teacherName, isBreak: false },
        { id: 23, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 24, subject: 'Công nghệ', class: '6B', teacher: 'Phạm Văn Khang', isBreak: false },
        { id: 25, subject: 'Sử', class: '6B', teacher: 'Lê Văn Quý', isBreak: false }
      ]
    ],
    afternoon: [
      [
        { id: 26, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 27, subject: 'Sinh', class: '6B', teacher: 'Nguyễn Thị Minh', isBreak: false },
        { id: 28, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 29, subject: 'Tin học', class: '6B', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 30, subject: 'Anh', class: '6B', teacher: 'Trần Thu Hà', isBreak: false }
      ],
      [
        { id: 31, subject: 'Lý', class: '6B', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 32, subject: 'Địa', class: '6B', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 33, subject: 'Âm nhạc', class: '6B', teacher: teacherName, isBreak: false },
        { id: 34, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 35, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false }
      ],
      [
        { id: 36, subject: 'Thể dục', class: '6B', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 37, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 38, subject: '', class: '', teacher: '', isBreak: true },
        { id: 39, subject: 'Mỹ thuật', class: '6B', teacher: 'Đỗ Lan Hương', isBreak: false },
        { id: 40, subject: 'Sinh', class: '6B', teacher: 'Nguyễn Thị Minh', isBreak: false }
      ],
      [
        { id: 41, subject: 'Anh', class: '6B', teacher: 'Trần Thu Hà', isBreak: false },
        { id: 42, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false },
        { id: 43, subject: 'Lý', class: '6B', teacher: 'Lê Đức Thắng', isBreak: false },
        { id: 44, subject: 'Thể dục', class: '6B', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
        { id: 45, subject: 'Công nghệ', class: '6B', teacher: 'Phạm Văn Khang', isBreak: false }
      ],
      [
        { id: 46, subject: 'Tin học', class: '6B', teacher: 'Trần Minh Tân', isBreak: false },
        { id: 47, subject: 'Âm nhạc', class: '6B', teacher: teacherName, isBreak: false },
        { id: 48, subject: 'Toán', class: '6B', teacher: 'Phan Văn Lương', isBreak: false },
        { id: 49, subject: 'Địa', class: '6B', teacher: 'Lê Mai Hoa', isBreak: false },
        { id: 50, subject: 'Văn', class: '6B', teacher: 'Nguyễn Thị Bình', isBreak: false }
      ]
    ]
  }
})

const allTimetables = computed(() => [
  ...timetables['6A'].morning,
  ...timetables['6A'].afternoon,
  ...timetables['6B'].morning,
  ...timetables['6B'].afternoon
])

const teacherNames = computed(() => {
  const set = new Set()
  allTimetables.value.forEach(row =>
    row.forEach(lesson => {
      if (lesson.teacher) set.add(lesson.teacher)
    })
  )
  return Array.from(set)
})

const selectedTeacher = ref('')

watchEffect(() => {
  if (!selectedTeacher.value && teacherNames.value.length) {
    selectedTeacher.value = teacherNames.value[0]
  }
  if (!teacherNames.value.includes(selectedTeacher.value)) {
    selectedTeacher.value = teacherNames.value[0] || ''
  }
})

const teacherOptions = computed(() =>
  teacherNames.value.map(t => ({ label: t, value: t }))
)

function getCell(cls, row, col) {
  return row < 5
    ? timetables[cls].morning[row][col]
    : timetables[cls].afternoon[row - 5][col]
}

function setCell(cls, row, col, lesson) {
  if (row < 5) {
    timetables[cls].morning[row][col] = lesson
  } else {
    timetables[cls].afternoon[row - 5][col] = lesson
  }
}


const selected = ref({ cls: '', row: null, col: null })
const dragSource = ref({ cls: '', row: null, col: null })
const contextMenu = ref({ show: false, x: 0, y: 0, cls: '', row: null, col: null })

function teacherFree(teacher, row, col, cls) {
  if (teacher === teacherName) {
    const slot =
      row < 5
        ? teacherBusyMorning[row][col]
        : teacherBusyAfternoon[row - 5][col]
    if (slot.class && slot.class !== cls) return false
  }
  for (const key of Object.keys(timetables)) {
    if (key === cls) continue
    const other =
      row < 5
        ? timetables[key].morning[row][col]
        : timetables[key].afternoon[row - 5][col]
    if (other.teacher === teacher && !other.isBreak) return false
  }
  return true
}

function onDragStart(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== selectedTeacher.value) return
  dragSource.value = { cls, row, col }
  selected.value = { cls, row, col }
}

function onDrop(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return
  if (src.cls === cls && src.row === row && src.col === col) return
  const target = getCell(cls, row, col)
  const source = getCell(src.cls, src.row, src.col)
  if (source.teacher !== selectedTeacher.value) {
    dragSource.value = { cls: '', row: null, col: null }
    selected.value = { cls: '', row: null, col: null }
    return
  }
  if (target.isBreak || source.isBreak) {
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!teacherFree(source.teacher, row, col, cls)) {
    message.error(`Giáo viên ${source.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!teacherFree(target.teacher, src.row, src.col, src.cls)) {
    message.error(`Giáo viên ${target.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  setCell(cls, row, col, source)
  setCell(src.cls, src.row, src.col, target)
  dragSource.value = { cls: '', row: null, col: null }
}

function openMenu(event, cls, row, col) {
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, cls, row, col }
}

function toggleBreak(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak) {
    cell.isBreak = false
    if (cell.backup) {
      if (!teacherFree(cell.backup.teacher, row, col, cls)) {
        message.error(`Giáo viên ${cell.backup.teacher} đang bận tiết đó`)
        return
      }
      cell.subject = cell.backup.subject
      cell.class = cell.backup.class
      cell.teacher = cell.backup.teacher
      cell.backup = undefined
    }
  } else {
    if (cell.subject) {
      message.error('Không thể đặt nghỉ vì đã có tiết học')
      contextMenu.value.show = false
      return
    }
    cell.isBreak = true
    cell.backup = { subject: cell.subject, class: cell.class, teacher: cell.teacher }
    cell.subject = ''
    cell.class = ''
    cell.teacher = ''
  }
  contextMenu.value.show = false
}

function isSelected(cls, row, col) {
  return (
    selected.value.cls === cls &&
    selected.value.row === row &&
    selected.value.col === col
  )
}

function startHighlight(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== selectedTeacher.value) return
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
}

function isValidTarget(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return false
  if (src.cls === cls && src.row === row && src.col === col) return false
  const source = getCell(src.cls, src.row, src.col)
  if (source.teacher !== selectedTeacher.value) return false
  const target = getCell(cls, row, col)
  if (source.isBreak || target.isBreak) return false
  return (
    teacherFree(source.teacher, row, col, cls) &&
    teacherFree(target.teacher, src.row, src.col, src.cls)
  )
}

function closeMenu() {
  contextMenu.value.show = false
  selected.value = { cls: '', row: null, col: null }
  dragSource.value = { cls: '', row: null, col: null }
}

onMounted(() => {
  window.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
</style>
