"""Align both Blender monitors to a front view and add a short physical cable lead."""
import bpy, os, math
ROOT='D:/tes share/portofolio-3d'
scene=next(s for s in bpy.data.scenes if s.name.startswith('Fariz Boot Workspace'))
bpy.context.window.scene=scene
def part(name):
    return next(o for o in scene.objects if o.name.split('.')[0]==name)
editor=part('EditorMonitor')
terminal=part('FloatingTerminal')
editor.rotation_euler=(0,0,0)
terminal.rotation_euler=(0,0,0)
editor.location=(-2.0,0,1.65)
terminal.location=(1.95,0,1.65)
keyboard=part('Keyboard')
keyboard.rotation_euler=(0,0,0)
keyboard.location=(-1.05,-.15,-.12)
part('FloatingTrackpad').location=(2.3,-.1,-.16)
scene.camera.location=(-.24,-12,1.65)
scene.camera.rotation_euler=(math.pi/2,0,0)
scene.camera.data.ortho_scale=8.6
scene.render.resolution_x=1440
scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.render.filepath=ROOT+'/public/images/workstation-poster.webp'

# Rubber power lead from the right monitor; the page SVG continues the cable motif.
if not any(o.name.startswith('PowerCableLead') for o in scene.objects):
    material=bpy.data.materials.new('Rubber cable jacket')
    material.diffuse_color=(.035,.028,.022,1)
    material.use_nodes=True
    bsdf=material.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value=(.035,.028,.022,1)
    bsdf.inputs['Roughness'].default_value=.52
    curve=bpy.data.curves.new('Power cable curve','CURVE');curve.dimensions='3D';curve.bevel_depth=.026;curve.bevel_resolution=3
    spline=curve.splines.new('BEZIER');spline.bezier_points.add(4)
    for point,position in zip(spline.bezier_points,[(3.35,.12,.75),(3.73,.12,.4),(3.82,.12,-.1),(3.72,.12,-.52),(4.0,.12,-.70)]):
        point.co=position;point.handle_left_type='AUTO';point.handle_right_type='AUTO'
    cable=bpy.data.objects.new('PowerCableLead',curve);scene.collection.objects.link(cable);cable.data.materials.append(material)
    bpy.ops.object.select_all(action='DESELECT');cable.select_set(True);bpy.context.view_layer.objects.active=cable
    bpy.ops.object.convert(target='MESH')
for o in scene.objects:o.select_set(o.type in {'MESH','EMPTY'} and not o.name.startswith('PosterOnly'))
bpy.context.view_layer.objects.active=part('EditorShell')
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/models/workstation.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/assets-source/workstation.blend')
result={'scene':scene.name,'model_bytes':os.path.getsize(ROOT+'/public/models/workstation.glb'),'front_facing':True}
