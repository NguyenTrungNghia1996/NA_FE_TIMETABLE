let ENDPOINTS = {
  LOGIN: "/api/users/login",
  PERMISSION: "/api/users/permission",
  REGISTER: "/api/users/register",
  CHANGE_PASSWORD: "/api/users/changePassword",
  RESET_PASSWORD: "/api/users/resetPassword",
  //PROVINCE
  PROVINCE: "/api/tinh",
  //SCHOOL_LEVEL
  SCHOOL_LEVEL: "/api/caphoc",
  SCHOOL_LEVEL_DETAIL: "/api/caphoc/detail",
  SCHOOL_LEVEL_BY_UNIT: "/api/caphoc/captheodonvi",
  //USER
  USER: "/api/users",
  USER_DETAIL: "/api/users/detail",
  //SCHOOL_SHIFT
  SCHOOL_SHIFT: "/api/cahoc",
  SCHOOL_SHIFT_DETAIL: "/api/cahoc/detail",
  SCHOOL_SHIFT_BY_UNIT: "/api/cahoc/catheodonvi",
  //UNIT
  UNIT: "/api/donvi",
  UNIT_DETAIL: "/api/donvi/detail",
  //SCHOOL_SITE
  SCHOOL_SITE: "/api/diemtruong",
  SCHOOL_SITE_DETAIL: "/api/diemtruong/detail",
  //CLASSROOM_TYPE
  CLASSROOM_TYPE: "/api/loaiphonghoc",
  CLASSROOM_TYPE_DETAIL: "/api/loaiphonghoc/detail",
  //KNOWLEDGE
  KNOWLEDGE: "/api/khoikienthuc",
  //SUBJECT
  SUBJECT: "/api/monhoc",
  SUBJECT_DETAIL: "/api/monhoc/detail",
  SUBJECT_AVOID: "/api/monhoc/tiettranhxep",
  SUBJECT_CLASS: "/api/monhoc/monlop",
  //EXPERTISE
  EXPERTISE: "/api/tochuyenmon",
  //GRADE_LEVEL
  GRADE_LEVEL: "/api/khoilop",
  GRADE_LEVEL_DETAIL: "/api/khoilop/detail",
  GRADE_LEVEL_BY_UNIT: "/api/khoilop/khoiloptheodonvi",
  //MENU
  MENU: "/api/menus",
  MENU_DETAIL: "/api/menus/detail",
  //ROLES
  ROLES: "/api/roles",
  ROLES_DETAIL: "/api/roles/detail",
  //CLASSROOM
  CLASSROOM: "/api/phonghoc",
  CLASSROOM_DETAIL: "/api/phonghoc/detail",
  CLASSROOM_BUSY: "api/phonghoc/tietban",
  //SCHOOL_PERIOD
  SCHOOL_PERIOD: "/api/tiethoc",
  SCHOOL_PERIOD_DETAIL: "/api/tiethoc/detail",
  //SCHOOL_DAY
  SCHOOL_DAY: "/api/ngayhoc",
  SCHOOL_DAY_DETAIL: "/api/ngayhoc/detail",
  //SCHOOL_SHIP
  SCHOOL_SHIP: "/api/banhoc",
  SCHOOL_SHIP_DETAIL: "/api/banhoc/detail",
  //FIXED_LESSON
  FIXED_LESSON: "/api/tietcodinh",
  FIXED_LESSON_DETAIL: "/api/tietcodinh/detail",
  ///api/phonghoc/tietban

  SUBJECT_GRADE_LEVEL: "/api/monhoc/monkhoilop",
  SUBJECT_GRADE_LEVEL_AVOID: "/api/monhoc/monkhoilop/tiettranhxep",
  SUBJECT_GRADE_LEVEL_SYNC: "/api/monhoc/monkhoilop/dongbo",

  SUBJECT_COMBINATION: "/api/tohopmon",

  TEACHER: "/api/giaovien",
  TEACHER_DETAIL: "/api/giaovien/detail",
  TEACHER_AVOID: "/api/giaovien/tiettranhxep",
  TEACHER_SUBJECT: "/api/giaovien/giaovienmonhoc",
  // Teacher assignment by teacher
  TEACHER_ASSIGNMENT: "/api/phanconggv",
  TEACHER_ASSIGNMENT_CLASS: "/api/phanconggv/lop",
  TEACHER_ASSIGNMENT_EXPORT: "/api/phanconggv/export",
  // STUDENT
  STUDENT: "/api/hocsinh",
  STUDENT_IMPORT: "/api/hocsinh/import",
  // CLASS
  CLASS: "/api/lophoc",
  CLASS_DETAIL: "/api/lophoc/detail",
  CLASS_BREAK: "/api/lophoc/tietnghi",
  CLASS_SUBJECT: "/api/lopmon",
  CLASS_SUBJECT_AVOID: "/api/lopmon/tiettranhxep",
  // REVIEW CLASS (Lớp ôn tập)
  REVIEW_CLASS: "/api/lopontap",
  REVIEW_CLASS_BREAK: "/api/lopontap/tietnghi",
  REVIEW_CLASS_STUDENT: "/api/lopontap/hocsinh",
  REVIEW_CLASS_STUDENT_IMPORT: "/api/lopontap/hocsinh/import",
  REVIEW_CLASS_STUDENT_LIST: "/api/lopontap/hocsinh/list",
  // REVIEW TEST TYPE (Loại bài test)
  REVIEW_TEST_TYPE: "/api/loaikiemtra",
  // REVIEW TEST (Bài kiểm tra)
  REVIEW_TEST: "/api/baikiemtra",
  REVIEW_TEST_RESULT_TEMPLATE: "/api/baikiemtra/ketqua/mau",
  REVIEW_TEST_RESULT_IMPORT: "/api/baikiemtra/ketqua/import",
  REVIEW_TEST_RESULT: "/api/baikiemtra/ketqua",
  // REVIEW SCHEDULE (Lịch ôn tập)
  REVIEW_SCHEDULE: "/api/lichontap",
  REVIEW_SCHEDULE_DETAIL: "/api/lichontap/detail",
  REVIEW_SCHEDULE_CANCEL_RESULT: "/api/lichontap/huykq",

  // REVIEW TIMETABLE (Lịch ôn tập - sắp xếp)
  REVIEW_TIMETABLE: "/api/lich",
  REVIEW_TIMETABLE_CLASS: "/api/lich/lop",
  REVIEW_TIMETABLE_TEACHER: "/api/lich/giaovien",
  REVIEW_TIMETABLE_FIND_CLASS_POSITION: "/api/lich/timvitri/lop",
  REVIEW_TIMETABLE_FIND_TEACHER_POSITION: "/api/lich/timvitri/giaovien",
  REVIEW_TIMETABLE_FIND_CLASS_UNSCHEDULED_POSITION: "/api/lich/timvitri/chuaxep/lop",
  REVIEW_TIMETABLE_FIND_TEACHER_UNSCHEDULED_POSITION: "/api/lich/timvitri/chuaxep/giaovien",
  REVIEW_TIMETABLE_FIND_CLASS_LESSON: "/api/lich/timtiet/lop",
  REVIEW_TIMETABLE_FIND_TEACHER_LESSON: "/api/lich/timtiet/giaovien",
  REVIEW_TIMETABLE_UPDATE_CLASS: "/api/lich/update/lop",
  REVIEW_TIMETABLE_UPDATE_TEACHER: "/api/lich/update/giaovien",
  REVIEW_TIMETABLE_UPDATE: "/api/lich/update",
  REVIEW_TIMETABLE_CANCEL_PERIOD: "/api/lich/huytiet",
  REVIEW_TIMETABLE_UNSCHEDULED: "/api/lich/tietchuaxep",
  REVIEW_TIMETABLE_ARRANGE_CLASS: "/api/lich/xeptheolop",
  REVIEW_TIMETABLE_ARRANGE_ROOM: "/api/lich/xeptheophong",
  REVIEW_TIMETABLE_ARRANGE_TEACHER: "/api/lich/xeptheogv",

  //TIMETABLE
  TIMETABLE: "/api/thoikhoabieu",
  TIMETABLE_DETAIL: "/api/thoikhoabieu/detail",
  TIMETABLE_COPY: "/api/thoikhoabieu/copy",
  TIMETABLE_SYNC: "/api/thoikhoabieu/sync",
  TIMETABLE_FIND_CLASS_POSITION: "/api/tkb/timvitri/lop",
  TIMETABLE_FIND_TEACHER_POSITION: "/api/tkb/timvitri/giaovien",
  TIMETABLE_FIND_TEACHER_UNSCHEDULED_POSITION: "/api/tkb/timvitri/chuaxep/giaovien",
  TIMETABLE_FIND_CLASS_UNSCHEDULED_POSITION: "/api/tkb/timvitri/chuaxep/lop",
  TIMETABLE_FIND_CLASS_LESSON: "/api/tkb/timtiet/lop",
  TIMETABLE_FIND_TEACHER_LESSON: "/api/tkb/timtiet/giaovien",
  TIMETABLE_UPDATE_CLASS: "/api/tkb/update/lop",
  TIMETABLE_UPDATE_TEACHER: "/api/tkb/update/giaovien",
  TIMETABLE_UPDATE: "/api/tkb/update",
  TIMETABLE_CLASS: "/api/tkb/lop",
  TIMETABLE_TEACHER: "/api/tkb/giaovien",
  TIMETABLE_LOCK_PERIOD: "/api/tkb/khoatiet",
  TIMETABLE_UNLOCK_PERIOD: "/api/tkb/huykhoa",
  TIMETABLE_LOCK_CLASS_PERIOD: "/api/tkb/khoatiet/mon",
  TIMETABLE_UNLOCK_CLASS_PERIOD: "/api/tkb/huykhoa/mon",
  TIMETABLE_LOCK_TEACHER_PERIOD: "/api/tkb/khoatiet/giaovien",
  TIMETABLE_UNLOCK_TEACHER_PERIOD: "/api/tkb/huykhoa/giaovien",
  TIMETABLE_CANCEL_PERIOD: "/api/tkb/huytiet",
  TIMETABLE_CANCEL_RESULT: "/api/thoikhoabieu/huykq",
  TIMETABLE_ARRANGE_ALL: "/api/tkb",
  TIMETABLE_SUBJECT_LIST: "/api/sotiet/monhoc",
  TIMETABLE_ARRANGE_SUBJECT: "/api/tkb/xeptheomon",
  TIMETABLE_CLASS_LIST: "/api/sotiet/lophoc",
  TIMETABLE_ARRANGE_CLASS: "/api/tkb/xeptheolop",
  TIMETABLE_CLASS_SUBJECT_LIST: "/api/sotiet/lopmon",
  TIMETABLE_ARRANGE_CLASS_SUBJECT: "/api/tkb/xeptheolopmon",
  TIMETABLE_ROOM_LIST: "/api/sotiet/phonghoc",
  TIMETABLE_ARRANGE_ROOM: "/api/tkb/xeptheophong",
  TIMETABLE_TEACHER_LIST: "/api/sotiet/giaovien",
  TIMETABLE_ARRANGE_TEACHER: "/api/tkb/xeptheogv",
  TIMETABLE_ARRANGE_GVCN: "/api/tkb/xeptheogvcn",
  TIMETABLE_ARRANGE_FUNCTION_ROOM: "/api/tkb/xeptheophongcn",
  TIMETABLE_UNSCHEDULED: "/api/tkb/tietchuaxep",

  TIMETABLE_EXPORT: "/api/export",
  TIMETABLE_EXPORT_CLASS: "/api/export/lop",
  TIMETABLE_EXPORT_TEACHER: "/api/export/giaovien",
  TIMETABLE_EXPORT_MATRIX_SCHOOL: "/api/export/matran/toantruong",
  TIMETABLE_EXPORT_MATRIX_TEACHER: "/api/export/matran/giaovien",
  TIMETABLE_EXPORT_MATRIX_GRADE: "/api/export/matran/khoi",
  TIMETABLE_EXPORT_MATRIX_EXPERTISE: "/api/export/matran/tohopmon",
  TIMETABLE_EXPORT_MATRIX_CLASS: "/api/export/matran/lop",
  TIMETABLE_EXPORT_MATRIX_CLASS_VERTICAL: "/api/export/matran/lopdoc",
  TIMETABLE_EXPORT_CSDL_NGANH: "/api/export/csdlnganh",

  S3: "/api/presigned_url",
  // YEAR (Năm học)
  YEAR: "/api/namhoc",
  YEAR_MAX_WEEK: "/api/namhoc/tuanmax",
  // HOLIDAY (Ngày nghỉ)
  HOLIDAY: "/api/ngaynghi",
  // PHANPHOI_CHUONGTRINH
  PHANPHOI_CHUONGTRINH: "/api/phanphoi_chuongtrinh",
  PHANPHOI_CHUONGTRINH_EXPORT: "/api/phanphoi_chuongtrinh/export",
  // PHANPHOI_CHUONGTRINH_CHITIET
  PHANPHOI_CHUONGTRINH_CHITIET: "/api/phanphoi_chuongtrinh_chitiet",
  // PHANPHOI_CHUONGTRINH_CHITIET - IMPORT
  PHANPHOI_CHUONGTRINH_CHITIET_IMPORT: "/api/phanphoi_chuongtrinh_chitiet/import",
  // LECTURE SCHEDULE (Lịch báo giảng)
  LECTURE_SCHEDULE: "/api/lich_baogiang",
  LECTURE_SCHEDULE_SLIP: "/api/lich_baogiang/phieu",
  LECTURE_SCHEDULE_SLIP_DETAIL: "/api/lich_baogiang/phieu/chitiet",
  LECTURE_SCHEDULE_EXPORT: "/api/lich_baogiang/export",
  LECTURE_SCHEDULE_SLIP_EXPORT: "/api/lich_baogiang/phieu/export",
  // BACKUP
  BACKUP_EXPORT: "/api/export/backup",
  BACKUP_IMPORT: "/api/file/backup/import",
  FILE_IMPORT: "/api/file/import",
  // UNIT INFO (Thông tin đơn vị)
  UNIT_INFO: "/api/thongtin_donvi",
};
import { useUserStore } from "~~/stores/userStore";
import { useUnitStore } from "~~/stores/unitStore";

class Request {
  constructor() {
    this.handler = {
      onRequest({ request, options }) { },
      onRequestError({ request, options, error }) { },
      onResponse({ request, response, options }) {
        return response._data;
      },
      async onResponseError({ request, response, options }) {
        if (response.status == 401) {
          message.info("Phiên Đăng Nhập Kết Thúc Vui Lòng Đăng Nhập Lại! ");
          const userStore = useUserStore();
          userStore.logout();
          return await navigateTo("/auth/login");
        }

        return response._data;
      },
    };
    const unitStore = useUnitStore();
    // this.base_url = useRuntimeConfig().public.baseURL;
    this.base_url = unitStore.baseUrl
  }

  createHeaders() {
    const userStore = useUserStore();
    return {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${userStore.token}`,
    };
  }

  get(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  post(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  // POST multipart/form-data (for file uploads). Do not set Content-Type so browser sets boundary
  postForm(url, options) {
    const userStore = useUserStore();
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
    };
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers,
      ...options,
      ...this.handler,
    });
  }
  patch(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PATCH",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  put(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PUT",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  delete(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "DELETE",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }

  download(url, options) {
    const { onRequest, onRequestError, onResponseError } = this.handler;
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: this.createHeaders(),
      responseType: "blob",
      onRequest,
      onRequestError,
      onResponseError,
      onResponse({ response }) {
        const headers = Object.fromEntries(response.headers);
        const blob = response._data instanceof Blob ? response._data : new Blob([response._data]);
        response._data = { blob, headers };
      },
      ...options,
    });
  }
}
class RestApi {
  constructor() {
    this.request = new Request();
    this.user = new User(this.request);
    this.province = new Province(this.request);
    this.school_level = new SchoolLevel(this.request);
    this.school_shift = new SchoolShift(this.request);
    this.school_ship = new SchoolShip(this.request);
    this.unit = new Unit(this.request);
    this.school_site = new SchoolSite(this.request);
    this.classroom_type = new ClassroomType(this.request);
    this.menu = new Menu(this.request);
    this.knowledge = new Knowledge(this.request);
    this.expertise = new Expertise(this.request);
    this.grade_level = new GradeLevel(this.request);
    this.subject = new Subject(this.request);
    this.roles = new Roles(this.request);
    this.classroom = new Classroom(this.request);
    this.school_day = new SchoolDay(this.request);
    this.school_period = new SchoolPeriod(this.request);
    this.fixed_lesson = new FixedLesson(this.request);
    this.subject_grade_level = new SubjectGradeLevel(this.request);
    this.subject_combination = new SubjectCombination(this.request);
    this.teacher = new Teacher(this.request);
    this.student = new Student(this.request);
    this.class = new Class(this.request);
    this.review_test = new ReviewTest(this.request);
    this.review_test_type = new ReviewTestType(this.request);
    this.review_class = new ReviewClass(this.request);
    this.review_schedule = new ReviewSchedule(this.request);
    this.review_timetable = new ReviewTimetable(this.request);
    this.timetable = new Timetable(this.request);
    this.year = new Year(this.request);
    this.holiday = new Holiday(this.request);
    this.phanphoi_chuongtrinh = new PhanphoiChuongtrinh(this.request);
    this.phanphoi_chuongtrinh_chitiet = new PhanphoiChuongtrinhChitiet(this.request);
    this.lecture_schedule = new LectureSchedule(this.request);
    this.backup = new Backup(this.request);
    this.unit_info = new UnitInfo(this.request);
  }
  async get_url_upload(acl, content_encoding, content_type, key, platform) {
    let data = { acl, content_encoding, content_type, key, platform };
    return this.request.put(ENDPOINTS.S3, { body: data });
  }
  async upload_s3(
    key,
    data,
    { acl, encoding, content_type, bucket } = {
      acl: "public-read",
      encoding: "base64",
      content_type: "image/jpeg",
      bucket: "website",
    },
  ) {
    const { data: resp } = await this.get_url_upload(acl, encoding, content_type, key, bucket);
    const url = resp.value?.data.upload_url;
    const direct_url = resp.value?.data.direct_url;
    if (!url || !direct_url) throw Error("presigned error");
    let buf;
    switch (encoding) {
      case "base64":
        // buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64")
        buf = _base64ToArrayBuffer(data.replace(/^data:image\/\w+;base64,/, ""));
        break;
      case "blob":
        buf = data;
        break;
      default:
        throw new Error("Invalid encoding");
    }
    await useFetch(url, {
      method: "PUT",
      headers: {
        Authorization: "",
        "x-amz-acl": acl || "public-read",
        "Content-Encoding": encoding,
        "Content-Type": content_type,
        "Access-Control-Allow-Origin": "*",
      },
      body: buf,
    });
    return direct_url;
  }
}
class User {
  constructor() {
    this.request = new Request();
  }
  async login(data) {
    return await this.request.post(ENDPOINTS.LOGIN, data);
  }
  async register(data) {
    return await this.request.post(ENDPOINTS.REGISTER, data);
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.USER, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.USER_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.USER, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.USER, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.USER, data);
  }
  async permission(data) {
    return await this.request.get(ENDPOINTS.PERMISSION, data);
  }
  async change_password(data) {
    return await this.request.post(ENDPOINTS.CHANGE_PASSWORD, data);
  }
  async reset_password(data) {
    return await this.request.post(ENDPOINTS.RESET_PASSWORD, data);
  }
}
class Province {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.PROVINCE, data);
  }
}
class SchoolLevel {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async list_by_unit(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL_BY_UNIT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_LEVEL, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_LEVEL, data);
  }
}
class SchoolShift {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async list_by_unit(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIFT_BY_UNIT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIFT_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_SHIFT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_SHIFT, data);
  }
}
class SchoolShip {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIP, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SHIP_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_SHIP, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_SHIP, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_SHIP, data);
  }
}
class Unit {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.UNIT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.UNIT_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.UNIT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.UNIT, data);
  }
  async import_file(data) {
    return await this.request.postForm(ENDPOINTS.FILE_IMPORT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.UNIT, data);
  }
}
class SchoolSite {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SITE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_SITE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_SITE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_SITE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_SITE, data);
  }
}
class ClassroomType {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_TYPE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.CLASSROOM_TYPE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.CLASSROOM_TYPE, data);
  }
}
class Menu {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.MENU, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.MENU, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.MENU, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.MENU, data);
  }
}
class Knowledge {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.KNOWLEDGE, data);
  }
  // async detail(data) {
  //   return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
  // }
  async create(data) {
    return await this.request.post(ENDPOINTS.KNOWLEDGE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.KNOWLEDGE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.KNOWLEDGE, data);
  }
}
class Expertise {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.EXPERTISE, data);
  }
  // async detail(data) {
  //   return await this.request.get(ENDPOINTS.MENU_DETAIL, data);
  // }
  async create(data) {
    return await this.request.post(ENDPOINTS.EXPERTISE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.EXPERTISE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.EXPERTISE, data);
  }
}
class GradeLevel {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.GRADE_LEVEL, data);
  }
  async list_by_unit(data) {
    return await this.request.get(ENDPOINTS.GRADE_LEVEL_BY_UNIT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.GRADE_LEVEL_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.GRADE_LEVEL, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.GRADE_LEVEL, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.GRADE_LEVEL, data);
  }
}
class Roles {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.ROLES, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.ROLES_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.ROLES, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.ROLES, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.ROLES, data);
  }
}
class Classroom {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.CLASSROOM, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.CLASSROOM, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.CLASSROOM, data);
  }
  async get_busy(data) {
    return await this.request.get(ENDPOINTS.CLASSROOM_BUSY, data);
  }
  async update_busy(data) {
    return await this.request.post(ENDPOINTS.CLASSROOM_BUSY, data);
  }
}
class Subject {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SUBJECT, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SUBJECT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SUBJECT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SUBJECT, data);
  }
  async get_avoid(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_AVOID, data);
  }
  async update_avoid(data) {
    return await this.request.post(ENDPOINTS.SUBJECT_AVOID, data);
  }
  async get_by_class(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_CLASS, data);
  }
}
class SchoolDay {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_DAY, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_DAY_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_DAY, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_DAY, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_DAY, data);
  }
}
class SchoolPeriod {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_PERIOD, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_PERIOD_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SCHOOL_PERIOD, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SCHOOL_PERIOD, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SCHOOL_PERIOD, data);
  }
}
class FixedLesson {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.FIXED_LESSON, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.FIXED_LESSON_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.FIXED_LESSON, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.FIXED_LESSON, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.FIXED_LESSON, data);
  }
}

class SubjectGradeLevel {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_GRADE_LEVEL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SUBJECT_GRADE_LEVEL, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SUBJECT_GRADE_LEVEL, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SUBJECT_GRADE_LEVEL, data);
  }
  async sync(data) {
    return await this.request.post(ENDPOINTS.SUBJECT_GRADE_LEVEL_SYNC, data);
  }
  async get_avoid(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_GRADE_LEVEL_AVOID, data);
  }
  async update_avoid(data) {
    return await this.request.post(ENDPOINTS.SUBJECT_GRADE_LEVEL_AVOID, data);
  }
}

class SubjectCombination {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SUBJECT_COMBINATION, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.SUBJECT_COMBINATION, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.SUBJECT_COMBINATION, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.SUBJECT_COMBINATION, data);
  }
}
class Teacher {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.TEACHER, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.TEACHER_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.TEACHER, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.TEACHER, data);
  }
  async get_avoid(data) {
    return await this.request.get(ENDPOINTS.TEACHER_AVOID, data);
  }
  async update_avoid(data) {
    return await this.request.post(ENDPOINTS.TEACHER_AVOID, data);
  }
  async get_subjects(data) {
    return await this.request.get(ENDPOINTS.TEACHER_SUBJECT, data);
  }
  async update_subjects(data) {
    return await this.request.post(ENDPOINTS.TEACHER_SUBJECT, data);
  }
  // Assignment overview for a teacher (by subject or all)
  async get_assignment(data) {
    return await this.request.get(ENDPOINTS.TEACHER_ASSIGNMENT, data);
  }
  // Assignment class list for a teacher/subject
  async get_assignment_classes(data) {
    return await this.request.get(ENDPOINTS.TEACHER_ASSIGNMENT_CLASS, data);
  }
  // Update assignments (body is subjectRows)
  async update_assignment(data) {
    return await this.request.post(ENDPOINTS.TEACHER_ASSIGNMENT, data);
  }
  async export_assignment(data) {
    return await this.request.download(ENDPOINTS.TEACHER_ASSIGNMENT_EXPORT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.TEACHER, data);
  }
}

class Student {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.STUDENT, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.STUDENT, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.STUDENT, data);
  }
  async import_file(data) {
    return await this.request.postForm(ENDPOINTS.STUDENT_IMPORT, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.STUDENT, data);
  }
}

class Class {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.CLASS, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.CLASS_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.CLASS, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.CLASS, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.CLASS, data);
  }
  async get_break(data) {
    return await this.request.get(ENDPOINTS.CLASS_BREAK, data);
  }
  async update_break(data) {
    return await this.request.post(ENDPOINTS.CLASS_BREAK, data);
  }
  async get_subjects(data) {
    return await this.request.get(ENDPOINTS.CLASS_SUBJECT, data);
  }
  async update_subjects(data) {
    return await this.request.post(ENDPOINTS.CLASS_SUBJECT, data);
  }
  async get_subject_avoid(data) {
    return await this.request.get(ENDPOINTS.CLASS_SUBJECT_AVOID, data);
  }
  async update_subject_avoid(data) {
    return await this.request.post(ENDPOINTS.CLASS_SUBJECT_AVOID, data);
  }
}

class ReviewTest {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.REVIEW_TEST, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.REVIEW_TEST, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.REVIEW_TEST, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.REVIEW_TEST, data);
  }
  async download_result_template(data) {
    return await this.request.download(ENDPOINTS.REVIEW_TEST_RESULT_TEMPLATE, data);
  }
  async import_result(data) {
    return await this.request.postForm(ENDPOINTS.REVIEW_TEST_RESULT_IMPORT, data);
  }
  async list_results(data) {
    return await this.request.get(ENDPOINTS.REVIEW_TEST_RESULT, data);
  }
  async save_results(data) {
    return await this.request.post(ENDPOINTS.REVIEW_TEST_RESULT, data);
  }
}

class ReviewTestType {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.REVIEW_TEST_TYPE, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.REVIEW_TEST_TYPE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.REVIEW_TEST_TYPE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.REVIEW_TEST_TYPE, data);
  }
}

class ReviewClass {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.REVIEW_CLASS, data);
  }
  async list_students(data) {
    return await this.request.get(ENDPOINTS.REVIEW_CLASS_STUDENT, data);
  }
  async list_student_ids(data) {
    return await this.request.get(ENDPOINTS.REVIEW_CLASS_STUDENT_LIST, data);
  }
  async update_student(data) {
    return await this.request.put(ENDPOINTS.REVIEW_CLASS_STUDENT, data);
  }
  async update_students(data) {
    return await this.request.post(ENDPOINTS.REVIEW_CLASS_STUDENT, data);
  }
  async import_students(data) {
    return await this.request.postForm(ENDPOINTS.REVIEW_CLASS_STUDENT_IMPORT, data);
  }
  async delete_student(data) {
    return await this.request.delete(ENDPOINTS.REVIEW_CLASS_STUDENT, data);
  }
  async get_break(data) {
    return await this.request.get(ENDPOINTS.REVIEW_CLASS_BREAK, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.REVIEW_CLASS, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.REVIEW_CLASS, data);
  }
  async update_break(data) {
    return await this.request.post(ENDPOINTS.REVIEW_CLASS_BREAK, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.REVIEW_CLASS, data);
  }
}

class ReviewSchedule {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.REVIEW_SCHEDULE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.REVIEW_SCHEDULE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.REVIEW_SCHEDULE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.REVIEW_SCHEDULE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.REVIEW_SCHEDULE, data);
  }
  async cancel_result(data) {
    return await this.request.put(ENDPOINTS.REVIEW_SCHEDULE_CANCEL_RESULT, data);
  }
}

class ReviewTimetable {
  constructor() {
    this.request = new Request();
  }
  normalizeArrangeBody(body = {}) {
    const res = { ...(body || {}) };
    if (res.id_tkb && !res.id_lich) res.id_lich = res.id_tkb;
    delete res.id_tkb;
    return res;
  }
  normalizeParams(params = {}) {
    const res = { ...(params || {}) };
    if (res.idtkb && !res.idlich) res.idlich = res.idtkb;
    if (res.Idtkb && !res.Idlich) res.Idlich = res.Idtkb;
    delete res.idtkb;
    delete res.Idtkb;
    return res;
  }
  normalizeBody(body = {}) {
    const res = { ...(body || {}) };
    if (res.id_tkb && !res.id_lich) res.id_lich = res.id_tkb;
    if (res.id_lich && !res.id_tkb) res.id_tkb = res.id_lich;
    return res;
  }
  async arrange_all(data) {
    const params = this.normalizeParams(data?.params || {});
    const cloned = { ...(data || {}) };
    delete cloned.params;
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE, { ...cloned, params });
  }
  async get_class(data) {
    const params = this.normalizeParams(data?.params || {});
    return await this.request.get(ENDPOINTS.REVIEW_TIMETABLE_CLASS, { ...data, params });
  }
  async get_teacher(data) {
    const params = this.normalizeParams(data?.params || {});
    return await this.request.get(ENDPOINTS.REVIEW_TIMETABLE_TEACHER, { ...data, params });
  }
  async find_class_position(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_CLASS_POSITION, { ...data, body, params });
  }
  async find_teacher_position(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_TEACHER_POSITION, { ...data, body, params });
  }
  async find_class_unscheduled_position(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_CLASS_UNSCHEDULED_POSITION, { ...data, body, params });
  }
  async find_teacher_unscheduled_position(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_TEACHER_UNSCHEDULED_POSITION, { ...data, body, params });
  }
  async find_class_lesson(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_CLASS_LESSON, { ...data, body, params });
  }
  async find_teacher_lesson(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_FIND_TEACHER_LESSON, { ...data, body, params });
  }
  async update_class(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_UPDATE_CLASS, { ...data, body, params });
  }
  async update_teacher(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_UPDATE_TEACHER, { ...data, body, params });
  }
  async update_period(data) {
    const body = this.normalizeBody(data?.body || {});
    const params = this.normalizeParams(data?.params || {});
    return await this.request.put(ENDPOINTS.REVIEW_TIMETABLE_UPDATE, { ...data, body, params });
  }
  async cancel_period(data) {
    return await this.request.put(ENDPOINTS.REVIEW_TIMETABLE_CANCEL_PERIOD, data);
  }
  async unscheduled(data) {
    const params = this.normalizeParams(data?.params || {});
    return await this.request.get(ENDPOINTS.REVIEW_TIMETABLE_UNSCHEDULED, { ...data, params });
  }
  async arrange_class(data) {
    const body = this.normalizeArrangeBody(data?.body || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_ARRANGE_CLASS, { ...data, body });
  }
  async arrange_room(data) {
    const body = this.normalizeArrangeBody(data?.body || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_ARRANGE_ROOM, { ...data, body });
  }
  async arrange_teacher(data) {
    const body = this.normalizeArrangeBody(data?.body || {});
    return await this.request.post(ENDPOINTS.REVIEW_TIMETABLE_ARRANGE_TEACHER, { ...data, body });
  }
}

class Timetable {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE, data);
  }
  async detail(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_DETAIL, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE, data);
  }
  async copy(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_COPY, data);
  }
  async sync(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_SYNC, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.TIMETABLE, data);
  }
  async find_class_position(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_CLASS_POSITION, data);
  }
  async find_teacher_position(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_TEACHER_POSITION, data);
  }
  async find_class_unscheduled_position(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_CLASS_UNSCHEDULED_POSITION, data);
  }
  async find_teacher_unscheduled_position(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_TEACHER_UNSCHEDULED_POSITION, data);
  }
  async find_class_lesson(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_CLASS_LESSON, data);
  }
  async find_teacher_lesson(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_FIND_TEACHER_LESSON, data);
  }
  async update_class(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_UPDATE_CLASS, data);
  }
  async update_teacher(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_UPDATE_TEACHER, data);
  }
  async update_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_UPDATE, data);
  }
  async get_class(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_CLASS, data);
  }
  async get_teacher(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_TEACHER, data);
  }
  async lock_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_LOCK_PERIOD, data);
  }
  async unlock_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_UNLOCK_PERIOD, data);
  }
  async lock_class_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_LOCK_CLASS_PERIOD, data);
  }
  async unlock_class_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_UNLOCK_CLASS_PERIOD, data);
  }
  async lock_teacher_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_LOCK_TEACHER_PERIOD, data);
  }
  async unlock_teacher_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_UNLOCK_TEACHER_PERIOD, data);
  }
  async cancel_period(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_CANCEL_PERIOD, data);
  }
  async cancel_result(data) {
    return await this.request.put(ENDPOINTS.TIMETABLE_CANCEL_RESULT, data);
  }
  async arrange_all(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_ALL, data);
  }
  async subject_list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_SUBJECT_LIST, data);
  }
  async arrange_subject(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_SUBJECT, data);
  }
  async class_list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_CLASS_LIST, data);
  }
  async arrange_class(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_CLASS, data);
  }
  async class_subject_list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_CLASS_SUBJECT_LIST, data);
  }
  async arrange_class_subject(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_CLASS_SUBJECT, data);
  }
  async room_list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_ROOM_LIST, data);
  }
  async arrange_room(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_ROOM, data);
  }
  async teacher_list(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_TEACHER_LIST, data);
  }
  async arrange_teacher(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_TEACHER, data);
  }
  async arrange_gvcn(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_GVCN, data);
  }
  async arrange_function_room(data) {
    return await this.request.post(ENDPOINTS.TIMETABLE_ARRANGE_FUNCTION_ROOM, data);
  }
  async unscheduled(data) {
    return await this.request.get(ENDPOINTS.TIMETABLE_UNSCHEDULED, data);
  }

  async export(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT, data);
    // return await this.request.get(ENDPOINTS.TIMETABLE_EXPORT, data)
  }
  async export_class(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_CLASS, data);
    // return await this.request.get(ENDPOINTS.TIMETABLE_EXPORT_CLASS, data)
  }
  async export_teacher(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_TEACHER, data);
    // return await this.request.get(ENDPOINTS.TIMETABLE_EXPORT_TEACHER, data)
  }
  async export_matrix_school(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_SCHOOL, data);
  }
  async export_matrix_teacher(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_TEACHER, data);
  }
  async export_matrix_grade(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_GRADE, data);
  }
  async export_matrix_expertise(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_EXPERTISE, data);
  }
  async export_matrix_class(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_CLASS, data);
  }
  async export_matrix_class_vertical(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_MATRIX_CLASS_VERTICAL, data);
  }
  async export_csdl_nganh(data) {
    return await this.request.download(ENDPOINTS.TIMETABLE_EXPORT_CSDL_NGANH, data);
  }
}
export default () => {
  return { RestApi: new RestApi() };
};

// YEAR CLASS
class Year {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.YEAR, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.YEAR, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.YEAR, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.YEAR, data);
  }
  // GET /api/namhoc/tuanmax?Id=...
  async max_week(data) {
    return await this.request.get(ENDPOINTS.YEAR_MAX_WEEK, data);
  }
}

// HOLIDAY CLASS
class Holiday {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.HOLIDAY, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.HOLIDAY, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.HOLIDAY, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.HOLIDAY, data);
  }
}

// LECTURE_SCHEDULE CLASS
class LectureSchedule {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.LECTURE_SCHEDULE, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.LECTURE_SCHEDULE, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.LECTURE_SCHEDULE, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.LECTURE_SCHEDULE, data);
  }
  async slip_list(data) {
    return await this.request.get(ENDPOINTS.LECTURE_SCHEDULE_SLIP, data);
  }
  async slip_detail(data) {
    return await this.request.get(ENDPOINTS.LECTURE_SCHEDULE_SLIP_DETAIL, data);
  }
  async export(data) {
    return await this.request.download(ENDPOINTS.LECTURE_SCHEDULE_EXPORT, data);
  }
  async slip_export(data) {
    return await this.request.download(ENDPOINTS.LECTURE_SCHEDULE_SLIP_EXPORT, data);
  }
}

// UNIT INFO (Thông tin đơn vị)
class UnitInfo {
  constructor() {
    this.request = new Request();
  }
  // GET /api/thongtin_donvi
  async get(data) {
    return await this.request.get(ENDPOINTS.UNIT_INFO, data);
  }
  // PUT /api/thongtin_donvi
  async update(data) {
    return await this.request.put(ENDPOINTS.UNIT_INFO, data);
  }
}

// BACKUP
class Backup {
  constructor() {
    this.request = new Request();
  }
  async export(data) {
    return await this.request.download(ENDPOINTS.BACKUP_EXPORT, data);
  }
  async restore(data) {
    return await this.request.postForm(ENDPOINTS.BACKUP_IMPORT, data);
  }
}

// PHANPHOI_CHUONGTRINH CLASS
class PhanphoiChuongtrinh {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.PHANPHOI_CHUONGTRINH, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.PHANPHOI_CHUONGTRINH, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.PHANPHOI_CHUONGTRINH, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.PHANPHOI_CHUONGTRINH, data);
  }
  async export(data) {
    return await this.request.download(ENDPOINTS.PHANPHOI_CHUONGTRINH_EXPORT, data);
  }
}

// PHANPHOI_CHUONGTRINH_CHITIET CLASS
class PhanphoiChuongtrinhChitiet {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.PHANPHOI_CHUONGTRINH_CHITIET, data);
  }
  async create(data) {
    return await this.request.post(ENDPOINTS.PHANPHOI_CHUONGTRINH_CHITIET, data);
  }
  async update(data) {
    return await this.request.put(ENDPOINTS.PHANPHOI_CHUONGTRINH_CHITIET, data);
  }
  async delete(data) {
    return await this.request.delete(ENDPOINTS.PHANPHOI_CHUONGTRINH_CHITIET, data);
  }
  // Import chi tiết PPCT từ file Excel
  async import_file(data) {
    return await this.request.postForm(ENDPOINTS.PHANPHOI_CHUONGTRINH_CHITIET_IMPORT, data);
  }
}
