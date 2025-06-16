import { useSettingStore } from "~/stores/settingStore";
import useApi from "~/composables/useApi";

export const useMenu = () => {
  const { RestApi } = useApi();
  const settingStore = useSettingStore();

  const buildTree = items => {
    const map = new Map();
    items.forEach(item => {
      map.set(item.id, {
        title: item.title,
        key: item.key,
        url: item.url,
        icon: item.icon,
        permissionBit: item.permissionBit,
        stt: item.stt ?? 0,
        children: [],
      });
    });
    items.forEach(item => {
      const parent = map.get(item.parent_Id);
      if (parent) {
        parent.children.push(map.get(item.id));
      }
    });
    const sortTree = nodes => {
      nodes.sort((a, b) => a.stt - b.stt);
      nodes.forEach(n => sortTree(n.children));
    };
    const roots = items
      .filter(i => i.parent_Id === null)
      .map(i => map.get(i.id));
    sortTree(roots);
    const stripStt = nodes => {
      nodes.forEach(n => {
        delete n.stt;
        if (n.children.length) stripStt(n.children);
      });
    };
    stripStt(roots);
    return roots;
  };

  const loadMenu = async () => {
    try {
      const { data } = await RestApi.menu.list();
      if (data.value?.status === "success") {
        const tree = buildTree(data.value.data.items);
        settingStore.setMenu(tree);
        return tree;
      }
    } catch (e) {
      console.error("Failed to load menu", e);
    }
  };

  return { loadMenu };
};
