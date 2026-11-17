"""Original interactive-workstation asset, based on assets-source/concepts/workstation-poster.svg."""
import bpy
import math
import os
from mathutils import Vector

ROOT = 'D:/tes share/portofolio-3d'
for directory in ['assets-source', 'public/models', 'public/images']:
    os.makedirs(os.path.join(ROOT, directory), exist_ok=True)
scene = bpy.data.scenes.new('Fariz Interactive Workstation')
bpy.context.window.scene = scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 88
scene.render.filepath = ROOT + '/public/images/workstation-poster.webp'
scene.view_settings.view_transform = 'AgX'
world = bpy.data.worlds.new('Workstation World')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.16, 0.2, 0.23, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.5
scene.world = world

def mat(name, color, metal=0, rough=0.35, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metal
    bsdf.inputs['Roughness'].default_value = rough
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*color, 1)
        bsdf.inputs['Emission Strength'].default_value = emission
    return m

graphite = mat('Graphite aluminium', (0.052, 0.075, 0.094), 0.65, 0.3)
edge = mat('Brushed edge', (0.15, 0.21, 0.25), 0.7, 0.3)
keys_mat = mat('Keycaps', (0.11, 0.16, 0.19), 0.25, 0.4)
glass = mat('Screen base', (0.006, 0.018, 0.025), 0.1, 0.28)
cyan = mat('Cyan indicator', (0.18, 0.8, 0.61), 0.2, 0.3, 1.5)
text_white = mat('Poster code white', (0.68, 0.79, 0.85), emission=1)
text_muted = mat('Poster code muted', (0.19, 0.32, 0.37), emission=0.8)
text_green = mat('Poster code cyan', (0.25, 0.82, 0.62), emission=1)
text_purple = mat('Poster code lavender', (0.61, 0.4, 0.82), emission=1)

root = bpy.data.objects.new('WorkstationRoot', None)
scene.collection.objects.link(root)
model_objects = [root]

def cube(name, position, dimensions, material, bevel=0.04, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=position)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    obj.parent = parent or root
    if bevel:
        mod = obj.modifiers.new('Rounded edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    model_objects.append(obj)
    return obj

def screen(name, position, width, height, parent=None):
    bpy.ops.mesh.primitive_plane_add(size=1, location=position, rotation=(math.pi / 2, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (width, height, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(glass)
    obj.parent = parent or root
    model_objects.append(obj)
    return obj

cube('DeskPlatform', (0, 0, 0), (5.05, 3.05, 0.14), graphite, 0.10)
cube('PlatformAccent', (0, -1.52, 0.02), (4.6, 0.018, 0.023), cyan, 0.005)
cube('MonitorFoot', (0, 0.58, 0.19), (1.22, 0.78, 0.09), edge)
cube('MonitorStand', (0, 0.62, 0.66), (0.28, 0.3, 0.9), graphite)
cube('MonitorBezel', (0, 0.45, 1.93), (3.42, 0.20, 2.13), edge, 0.09)
cube('MonitorInset', (0, 0.337, 1.96), (3.18, 0.035, 1.89), graphite, 0.04)
screen('EditorScreen', (0, 0.312, 1.99), 3.05, 1.77)
cube('MonitorIndicator', (0, 0.335, 0.94), (0.035, 0.02, 0.016), cyan, 0.006)
cube('KeyboardBase', (-0.25, -0.73, 0.18), (2.62, 0.86, 0.13), graphite)

# One joined keyboard mesh keeps runtime draw calls low.
vertices, faces = [], []
def key_box(x, y, width, depth):
    i = len(vertices)
    for z in [0.245, 0.31]:
        vertices.extend([(x-width/2,y-depth/2,z),(x+width/2,y-depth/2,z),(x+width/2,y+depth/2,z),(x-width/2,y+depth/2,z)])
    faces.extend([(i,i+3,i+2,i+1),(i+4,i+5,i+6,i+7),(i,i+1,i+5,i+4),(i+1,i+2,i+6,i+5),(i+2,i+3,i+7,i+6),(i+3,i,i+4,i+7)])
for row in range(4):
    for column in range(13):
        key_box(-1.38 + column * 0.187, -0.98 + row * 0.16, 0.151, 0.118)
key_box(-0.25, -0.33, 1.20, 0.10)
mesh = bpy.data.meshes.new('Keyboard keys geometry')
mesh.from_pydata(vertices, [], faces)
mesh.update()
keys = bpy.data.objects.new('KeyboardKeys', mesh)
scene.collection.objects.link(keys)
keys.parent = root
mesh.materials.append(keys_mat)
bevel = keys.modifiers.new('Keycap edges', 'BEVEL')
bevel.width = 0.014
bevel.segments = 2
keys.modifiers.new('Keycap normals', 'WEIGHTED_NORMAL')
model_objects.append(keys)
cube('Trackpad', (1.7, -0.65, 0.19), (0.69, 0.81, 0.08), edge)

terminal = bpy.data.objects.new('FloatingTerminal', None)
scene.collection.objects.link(terminal)
terminal.parent = root
terminal.location = (2.17, 0.2, 2.87)
terminal.rotation_euler = (0, -0.10, -0.18)
model_objects.append(terminal)
cube('TerminalFrame', (0, 0, 0), (1.77, 0.10, 1.10), graphite, 0.07, terminal)
screen('TerminalScreen', (0, -0.058, 0), 1.6, 0.94, terminal)

mobile = bpy.data.objects.new('FloatingPreview', None)
scene.collection.objects.link(mobile)
mobile.parent = root
mobile.location = (-2.08, -0.05, 1.62)
mobile.rotation_euler = (0, 0.10, 0.12)
model_objects.append(mobile)
cube('PreviewFrame', (0, 0, 0), (0.75, 0.09, 1.39), graphite, 0.09, mobile)
screen('PreviewScreen', (0, -0.052, 0), 0.62, 1.21, mobile)

# Poster-only text: excluded from GLB, where live canvas textures supply the content.
font_path = 'C:/Windows/Fonts/consola.ttf'
font = bpy.data.fonts.load(font_path) if os.path.exists(font_path) else None
def text(name, body, x, y, z, size=0.075, material=text_white, parent=None):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = body
    curve.size = size
    curve.extrude = 0
    if font:
        curve.font = font
    obj = bpy.data.objects.new('PosterOnly_' + name, curve)
    scene.collection.objects.link(obj)
    obj.location = (x, y, z)
    obj.rotation_euler = (math.pi/2, 0, 0)
    obj.parent = parent or root
    obj.data.materials.append(material)
    return obj

text('Tab', 'workspace / portfolio.tsx', -1.38, 0.304, 2.72, 0.075, text_green)
lines = [('// Muhammad Fariz', text_muted), ('const developer = {', text_purple), ("  name: 'Muhammad Fariz',", text_green), ("  stack: ['.NET', 'React'],", text_green), ("  focus: ['web', 'desktop'],", text_green), ("  mindset: 'always learning'", text_green), ('};', text_white), ('build(somethingMeaningful);', text_white)]
for index, (body, material) in enumerate(lines):
    text('Code'+str(index), str(index+1).zfill(2), -1.38, 0.304, 2.49-index*0.15, 0.07, text_muted)
    text('Line'+str(index), body, -1.15, 0.304, 2.49-index*0.15, 0.071, material)
text('TerminalTitle', 'terminal / portfolio', -0.72, -0.065, 0.34, 0.068, text_muted, terminal)
for index, body in enumerate(['> whoami', 'Muhammad Fariz', '> projects', 'Rintas  Ally  MailBlast']):
    text('Terminal'+str(index), body, -0.72, -0.065, 0.15-index*0.15, 0.061, text_green if index%2==0 else text_white, terminal)
text('PreviewTitle', 'BUILD', -0.24, -0.059, 0.39, 0.11, text_green, mobile)
text('PreviewBody', 'WEB\n\nDESKTOP\n\nDATA', -0.24, -0.059, 0.12, 0.067, text_white, mobile)

def aim(obj, target=(0, 0, 1.3)):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name, location, energy, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy, data.size, data.color = energy, size, color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    aim(obj)
area('Workstation key', (-4,-5,8), 1300, 5, (0.8,0.91,1.0))
area('Workstation fill', (5,-2,4), 1000, 4, (0.65,1.0,0.87))
area('Workstation rim', (1,4,6), 1600, 3, (0.4,0.76,1.0))
data = bpy.data.cameras.new('Workstation Camera')
camera = bpy.data.objects.new('Workstation Camera', data)
scene.collection.objects.link(camera)
camera.location = (5.4,-10,7.0)
data.type = 'ORTHO'
data.ortho_scale = 7.6
aim(camera, (0.15,0,1.35))
scene.camera = camera

for obj in scene.objects:
    obj.select_set(False)
for obj in model_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = keys
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/models/workstation.glb', export_format='GLB', use_selection=True, use_active_scene=True, export_apply=True, export_cameras=False, export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/assets-source/workstation.blend')
result = {'scene':scene.name,'bytes':os.path.getsize(ROOT+'/public/models/workstation.glb'),'meshes':sum(o.type=='MESH' for o in model_objects)}
