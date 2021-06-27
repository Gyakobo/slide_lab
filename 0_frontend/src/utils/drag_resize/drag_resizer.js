let DragResizer = function(){
  this.element = null
  this.actions = null

  this.action = null
  this.pointer_id = null

  this.on_width_change = null
  this.constrain_width = null
  this.constrain_height = null

  this.enable_cursor_styling = false

  this.start_x = 0
  this.start_y = 0
  this.start_pointer_x = 0
  this.start_pointer_y = 0

  this.cx = 0
  this.cy = 0
  this.start_angle = 0
  this.start_pointer_angle = 0

  this.start_width = 0
  this.start_height = 0
}
DragResizer.prototype.set_element = function (element) {
  this.element = element
}

const all_actions_enabled = ['top', 'bottom', 'left', 'right', 'drag', 'rotate']
DragResizer.prototype.set_actions = function (actions=all_actions_enabled) {
  this.actions = actions
}
DragResizer.prototype.set_on_width_change_callback = function (func) {
  this.on_width_change = func
}

DragResizer.prototype.set_enable_cursor_styling = function (is_enable) {
  this.enable_cursor_styling = is_enable
}

let constrain = function (v, v_min, v_max){
  return Math.max(v_min, Math.min(v_max, v))
}
DragResizer.prototype._add_constraint_functions = function () {
  this.constrain_width = function (width) {
    return constrain(width, this.min_width, this.max_width)
  }
  this.constrain_height = function (height) {
    return constrain(height, this.min_height, this.max_height)
  }
}
DragResizer.prototype.enable_default_constraints = function () {
  this.min_width = 0
  this.max_width = Infinity
  this.min_height = 0
  this.max_height = Infinity
  this._add_constraint_functions()
}
DragResizer.prototype.read_constraints_from_style = function () {
  let style = this.element.style

  if (style.minWidth !== '' || style.maxWidth !== '' || style.minHeight !== '' || style.maxHeight !== ''){
    this.min_width = (style.minWidth !== '') ? parseFloat(style.minWidth) : 0
    this.max_width = (style.maxWidth !== '') ? parseFloat(style.maxWidth) : Infinity
    this.min_height = (style.minHeight !== '') ? parseFloat(style.minHeight) : 0
    this.max_height = (style.maxHeight !== '') ? parseFloat(style.maxHeight) : Infinity

    this._add_constraint_functions()
  }
}

DragResizer.prototype.style_cursor = function (action){
  let cursor
  if (action === null){
    cursor = 'default'
  }
  else if (action === 'drag'){
    cursor = 'move'
  }
  else if (action === 'top'){
    cursor = 'n-resize'
  }
  else if (action === 'bottom'){
    cursor = 's-resize'
  }
  else if (action === 'left'){
    cursor = 'w-resize'
  }
  else if (action === 'right'){
    cursor = 'e-resize'
  }
  else if (action === 'lt'){
    cursor = 'nw-resize'
  }
  else if (action === 'lb'){
    cursor = 'sw-resize'
  }
  else if (action === 'rt'){
    cursor = 'ne-resize'
  }
  else if (action === 'rb'){
    cursor = 'se-resize'
  }
  else if (action === 'rotate'){
    cursor = 'wait' //todo add appropriate cursor styling!!
  }
  this.element.style.cursor = cursor
}

DragResizer.prototype.detect_action = function (x, y, rect) {
  let is_inside = x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom
  if (!is_inside){
    return null
  }

  let is_top = this.actions.includes('top') && (y - rect.top) < 10
  let is_bottom = this.actions.includes('bottom') && (rect.bottom - y) < 10
  let is_left = this.actions.includes('left') && (x - rect.left) < 10
  let is_right = this.actions.includes('right') && (rect.right - x) < 10

  if (is_left){
    if (is_top){
      return 'lt'
    } else if (is_bottom){
      return 'lb'
    } else{
      return 'left'
    }
  }else if (is_right){
    if (is_top){
      return 'rt'
    } else if (is_bottom){
      return 'rb'
    } else{
      return 'right'
    }
  }else if (is_top){
    return 'top'
  }else if (is_bottom){
    return 'bottom'
  }

  if (this.actions.includes('rotate')){
    let cx = (rect.right + rect.left) / 2
    let cy = (rect.bottom + rect.top) / 2

    let offset_x = Math.abs(x - cx)
    let offset_y = Math.abs(y - cy)

    let w_half = rect.width / 2
    let h_half = rect.height / 2
    let is_rotate = offset_x > (w_half - 20) && offset_x < (w_half - 10) &&
      offset_y > (h_half - 20) && offset_y < (h_half - 10)

    if (is_rotate){
      return 'rotate'
    }
  }

  if (this.actions.includes('drag')){
    return 'drag'
  }

  return null
}

DragResizer.prototype.on_focus_enter = function (pointer_id){
  this.element.style.userSelect = 'none'

  this.pointer_id = pointer_id
  // this.element.setPointerCapture(pointer_id)
}
DragResizer.prototype.on_focus_exit = function (){
  if (this.element !== null){
    this.element.style.userSelect = ''
  }
  // if (this.pointer_id !== null){
  //   this.element.releasePointerCapture(this.pointer_id)
  //   this.pointer_id = null
  // }

  this.action = null
}

DragResizer.prototype.pointerdown_listener = function (event) {
  if (event.which !== 1 || this.element === null){
    return
  }

  let x = event.pageX
  let y = event.pageY
  let rect = this.element.getBoundingClientRect()

  this.action = this.detect_action(x,y,rect)

  if (this.action === null){
    return
  }
  this.on_focus_enter(event.pointerId)

  this.start_pointer_x = x
  this.start_pointer_y = y

  if (this.action === 'drag'){
    let left = this.element.style.left
    let top = this.element.style.top
    this.start_x = left !== '' ? parseFloat(left) : 0
    this.start_y = top !== '' ? parseFloat(top) : 0
    this.start_pointer_x = x
    this.start_pointer_y = y
  }
  else if (this.action === 'rotate'){
    this.cx = (rect.right + rect.left) / 2
    this.cy = (rect.bottom + rect.top) / 2

    let dx = x - this.cx
    let dy = y - this.cy

    this.start_angle = 0
    this.start_pointer_angle = Math.atan2(dy, dx)
  }
  else{
    let left = this.element.style.left
    let top = this.element.style.top
    this.start_x = left !== '' ? parseFloat(left) : 0
    this.start_y = top !== '' ? parseFloat(top) : 0
    this.start_width = rect.width
    this.start_height = rect.height
    this.start_pointer_x = x
    this.start_pointer_y = y
  }
}

DragResizer.prototype.pointerup_listener = function (event) {
  if (event.which !== 1){
    return
  }
  this.on_focus_exit()
}
DragResizer.prototype.pointermove_listener = function (event) {
  if(this.element === null){
    return
  }
  if (this.enable_cursor_styling){
    let action = this.action
    if (action === null) {
      let x = event.pageX
      let y = event.pageY
      let rect = this.element.getBoundingClientRect()

      action = this.detect_action(x, y, rect)
    }

    this.style_cursor(action)
  }

  if (this.action === null){
    return
  }

  let x = event.pageX
  let y = event.pageY

  let dx = x - this.start_pointer_x
  let dy = y - this.start_pointer_y

  if (this.action === 'drag'){
    this.element.style.left = (this.start_x + dx) + 'px'
    this.element.style.top = (this.start_y + dy) + 'px'
  }
  else if(this.action === 'rotate'){
    let dx = x - this.cx
    let dy = y - this.cy
    let angle = Math.atan2(dy, dx)
    let dangle = angle - this.start_angle
    let dangle_deg = dangle / Math.PI * 180
    this.element.style.transform = 'rotate('+dangle_deg+'deg)'
  }
  else{
    let width = this.start_width
    let height = this.start_height
    let dleft = 0
    let dtop = 0

    if (['left','lt', 'lb'].includes(this.action)){
      dleft = dx
      width -= dx
    } else if (['right','rt', 'rb'].includes(this.action)){
      width += dx
    }

    if (['top','lt', 'rt'].includes(this.action)){
      dtop = dy
      height -= dy
    } else if (['bottom','lb', 'rb'].includes(this.action)){
      height += dy
    }

    if (this.constrain_width !== null){
      let cwidth = this.constrain_width(width)
      if (dleft !== 0){
        dleft += width - cwidth
      }
      width = cwidth
    }
    if (this.constrain_height !== null){
      let cheight = this.constrain_height(height)
      if (dtop !== 0){
        dtop += height - cheight
      }
      height = cheight
    }

    this.element.style.width = width + 'px'
    this.element.style.height = height + 'px'
    this.element.style.left = (this.start_x + dleft) + 'px'
    this.element.style.top = (this.start_y + dtop) + 'px'

    if(this.on_width_change !== null){
      this.on_width_change(width)
    }
  }

}
DragResizer.prototype.add_listeners = function () {
  this.mdl = (event) => {this.pointerdown_listener(event)}
  this.mul = (event) => {this.pointerup_listener(event)}
  this.mml = (event) => {this.pointermove_listener(event)}

  document.addEventListener('pointerdown', this.mdl)
  document.addEventListener('pointerup', this.mul)
  document.addEventListener('pointermove', this.mml)
}
DragResizer.prototype.remove_listeners = function () {
  document.removeEventListener('pointerdown', this.mdl)
  document.removeEventListener('pointerup', this.mul)
  document.removeEventListener('pointermove', this.mml)
}

export default {
  DragResizer:DragResizer
}