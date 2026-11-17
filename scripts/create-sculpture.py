"""Build the original portfolio sculpture in a separate Blender scene via MCP."""
import bpy
import bmesh
import math
import os
from mathutils import Vector

ROOT = 'D:/tes share/portofolio-3d'
for directory in ['assets-source', 'public/models', 'public/images']:
    os.makedirs(os.path.join(ROOT, directory), exist_ok=True)

# Do not clear or delete the user's current scene.
scene = bpy.data.scenes.new('Fariz Portfolio Sculpture')
bpy.context.window.scene = scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 86
scene.render.filepath = os.path.join(ROOT, 'public/images/code-sculpture-poster.webp')
scene.view_settings.view_transform = 'AgX'

world = bpy.data.worlds.new('Sculpture World')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.25, 0.24, 0.22, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.65

def material(name, color, metallic=0.0, roughness=0.32):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat

coral = material('Coral enamel', (0.95, 0.105, 0.075), 0.16, 0.27)
ivory = material('Warm ivory metal', (0.86, 0.85, 0.68), 0.55, 0.28)
lime = material('Lime satin', (0.64, 0.89, 0.12), 0.08, 0.25)
apricot = material('Apricot enamel', (1.0, 0.38, 0.12), 0.1, 0.3)
wire = material('Orbit bronze', (0.17, 0.14, 0.105), 0.6, 0.5)

root = bpy.data.objects.new('SculptureRoot', None)
scene.collection.objects.link(root)
meshes = []

def finish(obj, mat, bevel=0.06):
    obj.data.materials.append(mat)
    obj.parent = root
    if bevel:
        modifier = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 3
        modifier = obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
        modifier.keep_sharp = True
    meshes.append(obj)
    return obj

def extrude(name, points, depth, mat):
    count = len(points)
    vertices = [(x, -depth / 2, z) for x, z in points] + [(x, depth / 2, z) for x, z in points]
    faces = [tuple(range(count)), tuple(reversed(range(count, count * 2)))]
    faces += [(i, (i + 1) % count, (i + 1) % count + count, i + count) for i in range(count)]
    mesh = bpy.data.meshes.new(name + ' geometry')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    return finish(obj, mat)

left_points = [(-0.95, 1.35), (-2.2, 0), (-0.95, -1.35), (-0.48, -0.87), (-1.31, 0), (-0.48, 0.87)]
left = extrude('LeftBracket', left_points, 0.56, coral)
right = extrude('RightBracket', [(-x, z) for x, z in reversed(left_points)], 0.56, coral)
right.location = (0.1, 0.2, 0.1)
slash = extrude('Slash', [(-0.58, -1.75), (-0.16, -1.84), (0.61, 1.75), (0.19, 1.84)], 0.68, ivory)
slash.location.y = -0.18

bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.44, location=(2.35, -0.4, -1.64))
sphere = finish(bpy.context.object, lime, 0)
sphere.name = 'SatelliteSphere'
for polygon in sphere.data.polygons:
    polygon.use_smooth = True

bpy.ops.mesh.primitive_cube_add(size=0.54, location=(2.48, 0.1, 1.98))
cube = finish(bpy.context.object, apricot, 0.035)
cube.name = 'SatelliteCube'
cube.rotation_euler = (0.22, 0.25, -0.2)

bpy.ops.mesh.primitive_torus_add(major_radius=2.65, minor_radius=0.009, major_segments=96, minor_segments=6, location=(0, 0.7, 0))
ring = finish(bpy.context.object, wire, 0)
ring.name = 'Orbit'
ring.rotation_euler = (math.radians(77), math.radians(-18), math.radians(12))
ring.scale = (1, 0.85, 1)

root.rotation_euler = (math.radians(5), math.radians(-12), math.radians(-8))

def aim(obj, target=(0, 0, 0)):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def area(name, position, power, size, color):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'DISK'
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = position
    aim(obj)

area('Key softbox', (-4, -5, 7), 1000, 5, (1.0, 0.87, 0.74))
area('Fill softbox', (5, -2, 3), 650, 4, (0.78, 0.86, 1.0))
area('Rim softbox', (1, 4, 5), 1200, 3, (1.0, 0.52, 0.32))
camera_data = bpy.data.cameras.new('Poster Camera')
camera = bpy.data.objects.new('Poster Camera', camera_data)
scene.collection.objects.link(camera)
camera.location = (4.8, -10, 5.0)
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 7.2
aim(camera, (0.1, 0, 0))
scene.camera = camera

for obj in scene.objects:
    obj.select_set(False)
for obj in [root] + meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = left
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, 'public/models/code-sculpture.glb'), export_format='GLB', use_selection=True, use_active_scene=True, export_apply=True, export_cameras=False, export_lights=False, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, 'assets-source/code-sculpture.blend'))
result = {'status': 'created', 'scene': scene.name, 'meshes': len(meshes), 'model_bytes': os.path.getsize(os.path.join(ROOT, 'public/models/code-sculpture.glb')), 'blend_saved': True}
