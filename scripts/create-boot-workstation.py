"""Warm, floating dual-monitor workspace for the terminal-first portfolio intro."""
import bpy, math, os
from mathutils import Vector
ROOT = 'D:/tes share/portofolio-3d'
scene = bpy.data.scenes.new('Fariz Boot Workspace')
bpy.context.window.scene = scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = 1200
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 88
scene.render.filepath = ROOT + '/public/images/workstation-poster.webp'
scene.view_settings.view_transform = 'AgX'
world = bpy.data.worlds.new('Warm workspace atmosphere')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.23,0.20,0.18,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
scene.world = world
def material(name, rgb, metal=0, rough=.4, emission=0):
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*rgb,1);mat.use_nodes=True
    p=mat.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if emission:p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=emission
    return mat
charcoal=material('Warm charcoal ceramic',(.048,.042,.038),.2,.34)
rim=material('Soft graphite rim',(.15,.12,.10),.35,.34)
glass=material('Warm screen',(.014,.012,.011),0,.5)
coral=material('Coral accent',(.95,.11,.085),.1,.35,.3)
lime=material('Lime accent',(.69,.88,.17),.1,.35,.3)
ivory=material('Ivory keycaps',(.62,.57,.49),.15,.4)
white=material('Poster code',(.86,.81,.73),emission=1)
muted=material('Poster muted',(.36,.32,.28),emission=1)
root=bpy.data.objects.new('WorkstationRoot',None);scene.collection.objects.link(root);objects=[root]
def box(name,position,size,mat,bevel=.07,parent=root):
    bpy.ops.mesh.primitive_cube_add(size=1,location=position);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.parent=parent;o.data.materials.append(mat)
    b=o.modifiers.new('Soft edges','BEVEL');b.width=bevel;b.segments=4;o.modifiers.new('Surface normals','WEIGHTED_NORMAL');objects.append(o);return o
def plane(name,pos,width,height,parent):
    bpy.ops.mesh.primitive_plane_add(size=1,location=pos,rotation=(math.pi/2,0,0));o=bpy.context.object;o.name=name;o.scale=(width,height,1)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.parent=parent;o.data.materials.append(glass);objects.append(o);return o
def group(name,pos,rotation):
    o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.parent=root;o.location=pos;o.rotation_euler=rotation;objects.append(o);return o
ide=group('EditorMonitor',(-1.58,.38,1.95),(0,-.055,-.025))
box('EditorShell',(0,0,0),(4.30,.22,2.85),charcoal,.14,ide)
box('EditorCoralLip',(0,-.119,0),(4.13,.025,2.68),coral,.09,ide)
box('EditorInnerBezel',(0,-.142,0),(4.04,.03,2.59),rim,.075,ide)
plane('EditorScreen',(0,-.162,0),3.91,2.46,ide)
terminal=group('FloatingTerminal',(2.03,-.28,1.56),(0,.065,.035))
box('TerminalShell',(0,0,0),(3.45,.24,2.57),charcoal,.14,terminal)
box('TerminalLimeLip',(0,-.13,0),(3.28,.025,2.4),lime,.09,terminal)
box('TerminalInnerBezel',(0,-.15,0),(3.19,.025,2.31),rim,.075,terminal)
plane('TerminalScreen',(0,-.17,0),3.06,2.18,terminal)
# The keyboard is a light floating accent, not a desk-sized rigid base.
keyboard=group('Keyboard',(-.9,-.18,-.05),(.05,0,-.055))
box('KeyboardBase',(0,0,0),(2.6,.86,.11),charcoal,.10,keyboard)
vertices=[];faces=[]
for row in range(4):
    for col in range(13):
        x=-1.1+col*.183;y=-.29+row*.17;i=len(vertices)
        for z in [.055,.10]:vertices.extend([(x-.071,y-.055,z),(x+.071,y-.055,z),(x+.071,y+.055,z),(x-.071,y+.055,z)])
        faces.extend([(i,i+3,i+2,i+1),(i+4,i+5,i+6,i+7),(i,i+1,i+5,i+4),(i+1,i+2,i+6,i+5),(i+2,i+3,i+7,i+6),(i+3,i,i+4,i+7)])
mesh=bpy.data.meshes.new('Soft keycaps');mesh.from_pydata(vertices,[],faces);mesh.materials.append(ivory)
keys=bpy.data.objects.new('KeyboardKeys',mesh);scene.collection.objects.link(keys);keys.parent=keyboard;objects.append(keys)
b=keys.modifiers.new('Keycap bevel','BEVEL');b.width=.012;b.segments=2
box('CoralEnter',(1.0,-.27,.11),(.22,.13,.04),coral,.015,keyboard)
box('FloatingTrackpad',(2.0,-.1,-.12),(.75,.75,.08),rim,.12)
def poster_text(body,x,y,z,size,mat,parent):
    data=bpy.data.curves.new('PosterOnly','FONT');data.body=body;data.size=size
    o=bpy.data.objects.new('PosterOnly',data);scene.collection.objects.link(o);o.parent=parent;o.location=(x,y,z);o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(mat)
for i,line in enumerate(['workspace / ideas.tsx','','// turn ideas into something real',"const developer = 'Muhammad Fariz';",'',"const stack = ['.NET', 'React'];",'',"build({ ideas: true, details: true });"]):poster_text(line,-1.78,-.169,1.03-i*.22,.09,coral if i==0 else white,ide)
for i,line in enumerate(['portfolio / terminal','','fariz@workspace:~$','pnpm dev','','press enter to explore']):poster_text(line,-1.35,-.177,.87-i*.23,.10,lime if i in [2,3] else white,terminal)
def aim(o,target=(0,0,1.45)):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,pos,power,size,color in [('Warm key',(-4,-5,7),850,5,(1,.88,.73)),('Coral bounce',(5,-2,4),650,4,(1,.45,.32)),('Lime rim',(1,4,6),1000,4,(.85,1,.57))]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.size=size;data.color=color;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;aim(o)
data=bpy.data.cameras.new('Boot camera');camera=bpy.data.objects.new('Boot camera',data);scene.collection.objects.link(camera);camera.location=(-.3,-12,4.9);data.type='ORTHO';data.ortho_scale=7.7;aim(camera);scene.camera=camera
for o in scene.objects:o.select_set(False)
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=keys
bpy.ops.export_scene.gltf(filepath=ROOT+'/public/models/workstation.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False)
bpy.ops.wm.save_as_mainfile(filepath=ROOT+'/assets-source/workstation.blend')
result={'scene':scene.name,'model_bytes':os.path.getsize(ROOT+'/public/models/workstation.glb')}
