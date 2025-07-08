const selected = ref({ cls: '', row: null, col: null })
const dragSource = ref({ cls: '', row: null, col: null })

export const useDrag = () => {
  return { selected, dragSource }
}
