let ENDPOINTS = {
  LOGIN: "/api/users/login",
  PERMISSION: "/api/users/permission",
  //SCHOOL_LEVEL
  SCHOOL_LEVEL: "/api/caphoc",
  SCHOOL_LEVEL_DETAIL: "/api/caphoc/detail",
  //USER
  USER: "/api/users",
  USER_DETAIL: "/api/users/detail",
  //SCHOOL_SHIFT
  SCHOOL_SHIFT: "/api/cahoc",
  SCHOOL_SHIFT_DETAIL: "/api/cahoc/detail",
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
  //EXPERTISE
  EXPERTISE: "/api/tochuyenmon",
  //GRADE_LEVEL
  GRADE_LEVEL: "/api/khoilop",
  GRADE_LEVEL_DETAIL: "/api/khoilop/detail",
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

  SUBJECT_COMBINATION: "/api/tohopmon",
  S3: "/api/presigned_url",
};
import { useUserStore } from "~~/stores/userStore";
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
    this.base_url = useRuntimeConfig().public.baseURL;
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
}
class RestApi {
  constructor() {
    this.request = new Request();
    this.user = new User(this.request);
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
}
class SchoolLevel {
  constructor() {
    this.request = new Request();
  }
  async list(data) {
    return await this.request.get(ENDPOINTS.SCHOOL_LEVEL, data);
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
export default () => {
  return { RestApi: new RestApi() };
};
