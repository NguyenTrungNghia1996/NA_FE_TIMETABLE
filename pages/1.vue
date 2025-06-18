<template>
  <div>
    <h1>📅 Danh sách Thời Khóa Biểu</h1>

    <div v-for="(block) in data" :key="block.id" style="margin-bottom: 2rem;">

      <Timetable :block="block" />
    </div>
  </div>
</template>

<script setup>
const data = ref([
  {
    "id": 1,
    "ds_Ngay": [
      {
        "id": 1,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": true
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 2,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 3,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 4,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 5,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 6,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "ds_Ngay": [
      {
        "id": 1,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 2,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 3,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 4,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 5,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      },
      {
        "id": 6,
        "ds_Tiet": [
          {
            "id": 1,
            "trang_thai": false
          },
          {
            "id": 2,
            "trang_thai": false
          },
          {
            "id": 3,
            "trang_thai": false
          },
          {
            "id": 4,
            "trang_thai": false
          },
          {
            "id": 5,
            "trang_thai": false
          }
        ]
      }
    ]
  }
]
)

</script>