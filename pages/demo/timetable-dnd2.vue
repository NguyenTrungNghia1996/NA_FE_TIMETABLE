<template>
  <div class="min-h-screen bg-gray-50 p-4" @click="closeMenu">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header with selection controls -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <label for="class-select" class="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
            <a-select
              v-model:value="selectedClassId"
              class="w-48"
              id="class-select"
              size="large"
            >
              <a-select-option 
                v-for="k in classes" 
                :key="k.id" 
                :value="k.id"
              >
                {{ k.name }}
              </a-select-option>
            </a-select>
          </div>
          
          <div>
            <label for="teacher-select" class="block text-sm font-medium text-gray-700 mb-1">Giáo viên</label>
            <a-select
              v-model:value="selectedTeacherId"
              class="w-48"
              id="teacher-select"
              size="large"
            >
              <a-select-option 
                v-for="t in teachers" 
                :key="t.id" 
                :value="t.id"
              >
                {{ t.name }}
              </a-select-option>
            </a-select>
          </div>
          
          <div class="ml-auto flex items-center gap-2">
            <span class="text-sm text-gray-500">Kéo thả để sắp xếp tiết học</span>
            <a-tooltip title="Nhấn chuột phải vào ô tiết học để xem menu">
              <question-circle-outlined class="text-gray-400" />
            </a-tooltip>
          </div>
        </div>
      </div>

      <!-- Class timetable section -->
      <div v-if="currentClass" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-black">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">{{ currentClass.name }}</h2>
            <div class="flex gap-3">
              <div 
                v-for="stat in subjectStats" 
                :key="stat.subject" 
                class="text-sm px-3 py-1 bg-blue-50 rounded-full"
              >
                <span class="font-medium">{{ stat.subject }}:</span> 
                <span :class="{'text-green-600': stat.count === stat.max, 'text-orange-600': stat.count < stat.max}">
                  {{ stat.count }}/{{ stat.max }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <div v-for="(ca, caIndex) in currentClass.timetable.ds_Ca" :key="ca.id" class="p-4 border-b border-black last:border-b-0">
            <h3 class="text-lg font-semibold mb-3 text-gray-700">Ca {{ ca.id }}</h3>
            <table class="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th class="w-28 bg-gray-50 p-2 border border-black text-sm font-medium text-gray-500">Tiết / Ngày</th>
                  <th 
                    v-for="day in ca.ds_Ngay" 
                    :key="day.id" 
                    class="p-2 border border-black text-sm font-medium text-gray-500"
                  >
                    {{ day.ten }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, tIndex) in ca.ds_Ngay[0].ds_Tiet" :key="tiet.id">
                  <td class="p-2 border border-black text-center w-28 h-20 text-sm font-medium text-gray-600 bg-gray-50">
                    {{ tiet.ten }}
                  </td>
                  <td 
                    v-for="(day, dIndex) in ca.ds_Ngay" 
                    :key="day.id" 
                    class="p-2 border border-black text-center h-20 overflow-hidden transition-colors"
                    :class="cellClass(currentClassIndex, caIndex, dIndex, tIndex)"
                    @dragstart="dragStart($event, currentClassIndex, caIndex, dIndex, tIndex)"
                    @dragenter.prevent="dragEnter($event, currentClassIndex, caIndex, dIndex, tIndex)"
                    @dragover.prevent="dragOver($event, currentClassIndex, caIndex, dIndex, tIndex)"
                    @drop.prevent="drop($event, currentClassIndex, caIndex, dIndex, tIndex)"
                    @dragend="dragEnd"
                    @contextmenu.prevent="openMenu($event, currentClassIndex, caIndex, dIndex, tIndex)"
                    @click="day.ds_Tiet[tIndex].teacherId && selectTeacherLesson(day.ds_Tiet[tIndex].teacherId)"
                    :draggable="!day.ds_Tiet[tIndex].isBreak"
                  >
                    <div class="h-full flex flex-col justify-center">
                      <template v-if="!day.ds_Tiet[tIndex].isBreak">
                        <div class="font-medium line-clamp-1 text-sm">{{ day.ds_Tiet[tIndex].subject }}</div>
                        <div class="text-xs text-gray-500 line-clamp-1">{{ day.ds_Tiet[tIndex].teacher }}</div>
                      </template>
                      <span v-else class="text-red-500 text-sm">Nghỉ</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Teacher timetable section -->
      <div v-if="currentTeacher" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-black">
          <h2 class="text-xl font-bold text-gray-800">Lịch dạy - {{ currentTeacher.name }}</h2>
        </div>
        
        <div class="overflow-x-auto">
          <div v-for="(ca, ci) in currentTeacher.ds_Ca" :key="ci" class="p-4 border-b border-black last:border-b-0">
            <h4 class="text-md font-semibold mb-3 text-gray-700">Ca {{ ca.id }}</h4>
            <table class="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th class="w-28 bg-gray-50 p-2 border border-black text-sm font-medium text-gray-500">Tiết / Ngày</th>
                  <th 
                    v-for="day in ca.ds_Ngay" 
                    :key="day.id" 
                    class="p-2 border border-black text-sm font-medium text-gray-500"
                  >
                    {{ day.ten }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, ti) in ca.ds_Ngay[0].ds_Tiet" :key="ti">
                  <td class="p-2 border border-black text-center w-28 h-20 text-sm font-medium text-gray-600 bg-gray-50">
                    Tiết {{ ti + 1 }}
                  </td>
                  <td 
                    v-for="(day, di) in ca.ds_Ngay" 
                    :key="di" 
                    class="p-2 border border-black text-center h-20 overflow-hidden transition-colors"
                    :class="teacherCellClass(currentTeacher.id, ci, di, ti, day.ds_Tiet[ti].className)"
                    @click="teacherCellClick(ci, di, ti, day.ds_Tiet[ti].className, currentTeacher.id)"
                  >
                    <div class="h-full flex flex-col justify-center">
                      <span v-if="day.ds_Tiet[ti].className" class="line-clamp-2 text-sm">
                        <span class="font-medium">{{ day.ds_Tiet[ti].className }}</span>
                        <span class="text-gray-500 text-xs block">{{ day.ds_Tiet[ti].subject }}</span>
                      </span>
                      <span v-else class="text-gray-400">-</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Context menu -->
    <div 
      v-if="contextMenu.visible" 
      :style="contextMenu.style" 
      class="absolute bg-white border border-black rounded-md shadow-lg z-50 text-sm py-1 min-w-[160px]"
    >
      <ul>
        <li 
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 border-b border-black"
          @click.stop="removeLesson()"
        >
          <delete-outlined />
          <span>Xóa tiết học</span>
        </li>
        <li 
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 border-b border-black"
          @click.stop="toggleBreak()"
        >
          <pause-outlined />
          <span>{{ contextMenu.isBreak ? "Bỏ tiết nghỉ" : "Đặt tiết nghỉ" }}</span>
        </li>
        <li 
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          @click.stop="changeSubject()"
        >
          <swap-outlined />
          <span>Đổi môn học</span>
        </li>
      </ul>
    </div>

    <!-- Subject selection modal -->
    <a-modal 
      v-model:open="subjectSelect.visible" 
      title="Chọn môn học" 
      @ok="confirmSubject" 
      @cancel="cancelSubject" 
      :footer="null"
      centered
      :width="400"
    >
      <a-select 
        v-model:value="subjectSelect.value" 
        class="w-full"
        size="large"
        show-search
        option-filter-prop="label"
        placeholder="Chọn môn học"
      >
        <a-select-option 
          v-for="o in subjectSelect.options" 
          :key="o.id + '-' + o.subject" 
          :value="o.id + '-' + o.subject"
          :label="`${o.subject} - ${o.name}`"
        > 
          <div class="flex justify-between">
            <span>{{ o.subject }}</span>
            <span class="text-gray-500">{{ o.name }}</span>
          </div>
        </a-select-option>
      </a-select>
      <div class="flex justify-end gap-2 mt-6 pt-4">
        <a-button @click="cancelSubject">Hủy</a-button>
        <a-button type="primary" @click="confirmSubject">Xác nhận</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue";
import { notification } from "ant-design-vue";
import { 
  QuestionCircleOutlined, 
  DeleteOutlined, 
  PauseOutlined, 
  SwapOutlined 
} from '@ant-design/icons-vue';
import timetableData from "~/public/data/timetable.json";

// Reactive data
const classes = reactive([]);
const teachers = reactive([]);
const teacherOptions = ref([]);
const selectedClassId = ref(null);
const selectedTeacherId = ref(null);
const currentClass = computed(() => classes.find(k => k.id === selectedClassId.value));
const currentClassIndex = computed(() => classes.findIndex(k => k.id === selectedClassId.value));
const currentTeacher = computed(() => teachers.find(t => t.id === selectedTeacherId.value));

// Computed subject statistics
const subjectStats = computed(() => {
  const klass = currentClass.value;
  if (!klass) return [];
  const counts = {};
  klass.timetable.ds_Ca.forEach(ca => {
    ca.ds_Ngay.forEach(day => {
      day.ds_Tiet.forEach(t => {
        if (!t.isBreak && t.subject) {
          counts[t.subject] = (counts[t.subject] || 0) + 1;
        }
      });
    });
  });
  const limits = klass.limits || {};
  return Object.keys(limits).map(sub => ({ 
    subject: sub, 
    max: limits[sub], 
    count: counts[sub] || 0 
  }));
});

// Drag and drop state
const dragging = ref(null);
const lastHover = ref(null);
const validCells = reactive(new Set());
const highlightedTeacherId = ref(null);

// Context menu state
const contextMenu = reactive({
  visible: false,
  style: { top: "0px", left: "0px" },
  ki: 0,
  ci: 0,
  di: 0,
  ti: 0,
  get isBreak() {
    const lesson = classes[this.ki]?.timetable.ds_Ca[this.ci]?.ds_Ngay[this.di]?.ds_Tiet[this.ti];
    return lesson?.isBreak;
  },
});

// Subject selection modal state
const subjectSelect = reactive({
  visible: false,
  options: [],
  value: "",
  ki: 0,
  ci: 0,
  di: 0,
  ti: 0,
});

// Helper functions
function showWarning(content) {
  notification.warning({ 
    message: "Thông báo", 
    description: content,
    placement: 'topRight'
  });
}

function selectTeacherLesson(id) {
  highlightedTeacherId.value = id;
}

function teacherCellClick(ci, di, ti, className, teacherId) {
  highlightedTeacherId.value = teacherId;
  if (!className) {
    dragging.value = null;
    validCells.clear();
    return;
  }
  const ki = classes.findIndex(c => c.name === className);
  if (ki === -1) {
    dragging.value = null;
    validCells.clear();
    return;
  }
  dragging.value = { ki, ci, di, ti };
  highlightValidCells();
}

// Drag and drop handlers
function dragStart(e, ki, ci, di, ti) {
  dragging.value = { ki, ci, di, ti };
  lastHover.value = null;
  const lesson = classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti];
  highlightedTeacherId.value = lesson.teacherId;
  highlightValidCells();
  
  // Set custom drag image
  const dragImage = document.createElement('div');
  dragImage.innerHTML = `
    <div class="bg-white border border-black rounded p-2 shadow-md text-sm">
      <div class="font-medium">${lesson.subject}</div>
      <div class="text-gray-500">${lesson.teacher}</div>
    </div>
  `;
  dragImage.style.position = 'absolute';
  dragImage.style.left = '-9999px';
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 0, 0);
  setTimeout(() => document.body.removeChild(dragImage), 0);
}

function dragOver(e, ki, ci, di, ti) {
  e.dataTransfer.dropEffect = validCells.has(key(ki, ci, di, ti)) ? "move" : "none";
}

function dragEnter(e, ki, ci, di, ti) {
  lastHover.value = { ki, ci, di, ti };
}

function drop(e, ki, ci, di, ti) {
  if (!dragging.value) return;
  const destKey = key(ki, ci, di, ti);
  const destLesson = getLesson({ ki, ci, di, ti });
  
  if (!validCells.has(destKey)) {
    if (destLesson.isBreak) {
      showWarning("Không thể di chuyển vào tiết nghỉ");
    } else {
      const srcLesson = getLesson(dragging.value);
      const conflict = findConflictClass(srcLesson.teacherId, ci, di, ti, dragging.value);
      if (conflict) {
        showWarning(`Trùng tiết với lớp ${conflict}`);
      } else {
        showWarning("Không thể di chuyển tiết học vào ô này");
      }
    }
    dragging.value = null;
    validCells.clear();
    return;
  }
  
  const src = getLesson(dragging.value);
  const dest = destLesson;
  
  if (!canSwap(dragging.value, { ki, ci, di, ti })) {
    dragging.value = null;
    validCells.clear();
    return;
  }
  
  // Swap lesson content
  [src.subject, dest.subject] = [dest.subject, src.subject];
  [src.teacher, dest.teacher] = [dest.teacher, src.teacher];
  [src.teacherId, dest.teacherId] = [dest.teacherId, src.teacherId];
  
  dragging.value = null;
  validCells.clear();
  
  // Update teacher schedules
  teachers.splice(0, teachers.length, ...buildTeacherSchedules());
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id;
  }
}

function dragEnd() {
  if (!dragging.value) return;
  
  if (lastHover.value) {
    const destKey = key(lastHover.value.ki, lastHover.value.ci, lastHover.value.di, lastHover.value.ti);
    const destLesson = getLesson(lastHover.value);
    
    if (!validCells.has(destKey)) {
      if (destLesson.isBreak) {
        showWarning("Không thể di chuyển vào tiết nghỉ");
      } else {
        const srcLesson = getLesson(dragging.value);
        const conflict = findConflictClass(srcLesson.teacherId, lastHover.value.ci, lastHover.value.di, lastHover.value.ti, dragging.value);
        if (conflict) {
          showWarning(`Trùng tiết với lớp ${conflict}`);
        } else {
          showWarning("Không thể di chuyển tiết học vào ô này");
        }
      }
    }
  } else {
    showWarning("Không thể di chuyển tiết học vào ô này");
  }
  
  dragging.value = null;
  validCells.clear();
  lastHover.value = null;
}

// Context menu handlers
function openMenu(e, ki, ci, di, ti) {
  contextMenu.visible = true;
  contextMenu.style = { top: `${e.clientY}px`, left: `${e.clientX}px` };
  contextMenu.ki = ki;
  contextMenu.ci = ci;
  contextMenu.di = di;
  contextMenu.ti = ti;
}

function closeMenu() {
  contextMenu.visible = false;
  subjectSelect.visible = false;
}

function removeLesson() {
  const lesson = getLesson(contextMenu);
  Object.assign(lesson, { subject: "", teacher: "", teacherId: null, isBreak: false });
  
  // Update teacher schedules
  teachers.splice(0, teachers.length, ...buildTeacherSchedules());
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id;
  }
  
  closeMenu();
}

function toggleBreak() {
  const lesson = getLesson(contextMenu);
  
  if (!lesson.isBreak && (lesson.subject || lesson.teacherId)) {
    showWarning("Không thể đặt tiết nghỉ vì đã có tiết học");
    closeMenu();
    return;
  }
  
  lesson.isBreak = !lesson.isBreak;
  if (lesson.isBreak) {
    lesson.subject = "";
    lesson.teacher = "";
    lesson.teacherId = null;
  }
  
  // Update teacher schedules
  teachers.splice(0, teachers.length, ...buildTeacherSchedules());
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id;
  }
  
  closeMenu();
}

function changeSubject() {
  const lesson = getLesson(contextMenu);
  
  // Filter available teacher options
  const options = teacherOptions.value.filter(t => {
    // Keep current teacher
    if (t.id === lesson.teacherId) return true;
    
    // Check for teacher availability
    for (let k = 0; k < classes.length; k++) {
      const slot = classes[k].timetable.ds_Ca[contextMenu.ci].ds_Ngay[contextMenu.di].ds_Tiet[contextMenu.ti];
      if (slot.teacherId === t.id && !(k === contextMenu.ki && slot === lesson)) {
        return false;
      }
    }
    
    // Check subject limits
    const limit = classes[contextMenu.ki].limits?.[t.subject];
    if (limit !== undefined) {
      const count = subjectCount(contextMenu.ki, t.subject);
      const inc = t.subject === lesson.subject ? 0 : 1;
      if (count + inc > limit) return false;
    }
    
    return true;
  });
  
  if (!options.length) {
    showWarning("Không có môn học phù hợp");
    closeMenu();
    return;
  }
  
  // Setup subject selection modal
  subjectSelect.options = options;
  subjectSelect.value = lesson.teacherId 
    ? `${lesson.teacherId}-${lesson.subject}` 
    : `${options[0].id}-${options[0].subject}`;
  subjectSelect.ki = contextMenu.ki;
  subjectSelect.ci = contextMenu.ci;
  subjectSelect.di = contextMenu.di;
  subjectSelect.ti = contextMenu.ti;
  subjectSelect.visible = true;
  contextMenu.visible = false;
}

function confirmSubject() {
  const [idStr, subject] = subjectSelect.value.split("-");
  const id = Number(idStr);
  const option = subjectSelect.options.find(o => o.id === id && o.subject === subject);
  
  if (option) {
    const lesson = classes[subjectSelect.ki].timetable.ds_Ca[subjectSelect.ci].ds_Ngay[subjectSelect.di].ds_Tiet[subjectSelect.ti];
    lesson.isBreak = false;
    lesson.subject = option.subject;
    lesson.teacher = option.name;
    lesson.teacherId = option.id;
    
    // Update teacher schedules
    teachers.splice(0, teachers.length, ...buildTeacherSchedules());
    if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
      selectedTeacherId.value = teachers[0].id;
    }
  }
  
  subjectSelect.visible = false;
}

function cancelSubject() {
  subjectSelect.visible = false;
}

// Utility functions
function key(ki, ci, di, ti) {
  return `${ki}-${ci}-${di}-${ti}`;
}

function getLesson({ ki, ci, di, ti }) {
  return classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti];
}

function subjectCount(ki, subject) {
  let count = 0;
  classes[ki].timetable.ds_Ca.forEach(ca => {
    ca.ds_Ngay.forEach(day => {
      day.ds_Tiet.forEach(p => {
        if (p.subject === subject) count++;
      });
    });
  });
  return count;
}

function findConflictClass(teacherId, ci, di, ti, src) {
  for (let k = 0; k < classes.length; k++) {
    const slot = classes[k].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti];
    if (slot.teacherId === teacherId && !(src && k === src.ki && ci === src.ci && di === src.di && ti === src.ti)) {
      return classes[k].name;
    }
  }
  return null;
}

function canSwap(src, dest) {
  if (src.ki === dest.ki) return true;
  
  const srcLesson = getLesson(src);
  const destLesson = getLesson(dest);
  
  // Check destination class limits
  const destLimit = classes[dest.ki].limits?.[srcLesson.subject];
  if (destLimit !== undefined) {
    const destCount = subjectCount(dest.ki, srcLesson.subject);
    const inc = destLesson.subject === srcLesson.subject ? 0 : 1;
    if (destCount + inc > destLimit) return false;
  }
  
  // Check source class limits
  const srcLimit = classes[src.ki].limits?.[destLesson.subject];
  if (srcLimit !== undefined) {
    const srcCount = subjectCount(src.ki, destLesson.subject);
    const inc = destLesson.subject === srcLesson.subject ? 0 : 1;
    if (srcCount + inc > srcLimit) return false;
  }
  
  return true;
}

function highlightValidCells() {
  validCells.clear();
  if (!dragging.value) return;
  
  for (let k = 0; k < classes.length; k++) {
    for (let c = 0; c < classes[k].timetable.ds_Ca.length; c++) {
      const days = classes[k].timetable.ds_Ca[c].ds_Ngay;
      for (let d = 0; d < days.length; d++) {
        const periods = days[d].ds_Tiet;
        for (let t = 0; t < periods.length; t++) {
          if (periods[t].isBreak) continue;
          
          const other = getLesson({ ki: k, ci: c, di: d, ti: t });
          const srcLesson = getLesson(dragging.value);
          
          // Skip if teacher is already teaching at this time
          if (other.teacherId === srcLesson.teacherId && 
              !(k === dragging.value.ki && c === dragging.value.ci && d === dragging.value.di && t === dragging.value.ti)) {
            continue;
          }
          
          // Check for conflicts and limits
          const conflict = findConflictClass(srcLesson.teacherId, c, d, t, dragging.value);
          if (!conflict && canSwap(dragging.value, { ki: k, ci: c, di: d, ti: t })) {
            validCells.add(key(k, c, d, t));
          }
        }
      }
    }
  }
}

// Cell styling functions
function cellClass(ki, ci, di, ti) {
  const lesson = classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti];
  const classList = [];
  
  // Base styles
  if (lesson.isBreak) {
    classList.push('bg-gray-100 text-red-500');
  } else if (lesson.subject) {
    classList.push('bg-white hover:bg-gray-50');
  } else {
    classList.push('bg-gray-50 hover:bg-gray-100');
  }
  // Highlight teacher's lessons
  if (highlightedTeacherId.value && lesson.teacherId === highlightedTeacherId.value) {
    classList.push('bg-yellow-50');
  }
  
  return classList.join(' ');
}

function teacherCellClass(id, ci, di, ti, className) {
  const classesIndex = className ? classes.findIndex(c => c.name === className) : -1;
  const classList = ['bg-white hover:bg-gray-50'];
  
  // Highlight selected teacher's lessons
  if (highlightedTeacherId.value === id && className) {
    classList.push('bg-yellow-50');
  }
  
  return classList.join(' ');
}

// Initialize data
onMounted(() => {
  classes.push(...getData());
  teachers.push(...buildTeacherSchedules());
  teacherOptions.value = buildTeacherOptions();
  
  if (classes.length) selectedClassId.value = classes[0].id;
  if (teachers.length) selectedTeacherId.value = teachers[0].id;
});

function getData() {
  return timetableData;
}

function buildTeacherOptions() {
  const map = {};
  classes.forEach(klass => {
    klass.timetable.ds_Ca.forEach(ca => {
      ca.ds_Ngay.forEach(day => {
        day.ds_Tiet.forEach(t => {
          if (!t.teacherId) return;
          if (!map[t.teacherId]) {
            map[t.teacherId] = { id: t.teacherId, name: t.teacher, subject: t.subject };
          }
        });
      });
    });
  });
  return Object.values(map);
}

function buildTeacherSchedules() {
  const result = {};
  const sampleCa = classes[0]?.timetable.ds_Ca[0];
  const daysCount = sampleCa ? sampleCa.ds_Ngay.length : 0;
  const periodsCount = sampleCa ? sampleCa.ds_Ngay[0].ds_Tiet.length : 0;
  
  function initTeacher(id, name) {
    const teacher = {
      id,
      name,
      ds_Ca: [
        { id: 1, ds_Ngay: [] },
        { id: 2, ds_Ngay: [] },
      ],
    };
    
    for (let c = 0; c < 2; c++) {
      for (let d = 0; d < daysCount; d++) {
        const day = { id: d + 1, ten: `Thứ ${d + 2}`, ds_Tiet: [] };
        for (let t = 0; t < periodsCount; t++) {
          day.ds_Tiet.push({ subject: "", className: "", isBreak: false });
        }
        teacher.ds_Ca[c].ds_Ngay.push(day);
      }
    }
    result[id] = teacher;
  }

  classes.forEach(klass => {
    klass.timetable.ds_Ca.forEach((ca, ci) => {
      ca.ds_Ngay.forEach((day, di) => {
        day.ds_Tiet.forEach((tiet, ti) => {
          if (!result[tiet.teacherId]) {
            initTeacher(tiet.teacherId, tiet.teacher);
          }
          
          const target = result[tiet.teacherId].ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti];
          Object.assign(target, { 
            subject: tiet.subject, 
            className: klass.name, 
            isBreak: tiet.isBreak 
          });
        });
      });
    });
  });

  return Object.values(result);
}
</script>