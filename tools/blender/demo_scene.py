"""Build a small original Go set to prove modeling, lighting, and CPU rendering."""
import bpy, math, os
from pathlib import Path
from mathutils import Vector
OUT=os.environ.get('BLENDER_DEMO_OUTPUT',str(Path.home()/'.cache/vibeknowledge/blender'))
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=48;scene.cycles.use_denoising=False
scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.world.color=(.035,.045,.06)

def material(name,color,rough=.4,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;return m
wood=material('Warm maple',(.46,.245,.085),.32)
n=wood.node_tree.nodes;l=wood.node_tree.links;tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=9;tex.inputs['Detail'].default_value=3
coord=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(1,32,3);l.new(coord.outputs['Generated'],mapping.inputs[0]);l.new(mapping.outputs['Vector'],tex.inputs['Vector']);ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(.14,.052,.018,1);ramp.color_ramp.elements[1].color=(.63,.36,.13,1);l.new(tex.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])
black=material('Black slate',(.009,.012,.015),.20);white=material('White shell',(.86,.88,.84),.23);ink=material('Inlaid grid',(.035,.025,.016),.6);floor=material('Midnight stage',(.014,.023,.035),.48)

def box(name,loc,scale,mat,bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if bevel:m=o.modifiers.new('Soft edges','BEVEL');m.width=bevel;m.segments=4;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
box('Go board',(0,0,.13),(3,3,.26),wood,.07)
for i in range(9):
 q=-1.3+i*.325;box('Grid horizontal',(0,q,.264),(2.6,.012,.004),ink);box('Grid vertical',(q,0,.264),(.012,2.6,.004),ink)
for x,y in [(-.65,-.65),(.65,.65),(-.65,.65),(.65,-.65),(0,0)]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.027,depth=.004,location=(x,y,.268));bpy.context.object.data.materials.append(ink)
for i,(x,y) in enumerate([(-.65,.65),(.65,-.65),(-.65,-.65),(.65,.65),(0,.325),(.325,0)]):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=(x,y,.34));o=bpy.context.object;o.name=('Black' if i%2==0 else 'White')+' stone';o.scale=(.142,.142,.070);o.data.materials.append(black if i%2==0 else white);bpy.ops.object.shade_smooth()
box('Stage',(0,0,-.12),(200,200,.1),floor)

def light(name,loc,power,color,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
light('Warm key',(-3,-4,6),650,(1,.84,.65),4);light('Cool rim',(3,2,4),850,(.35,.7,1),3);light('Soft fill',(-3,3,2),220,(.7,.85,1),3)
bpy.ops.object.camera_add(location=(3.9,-4.7,4.3));camera=bpy.context.object;camera.name='Hero camera';camera.rotation_euler=(Vector((0,0,.2))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=48;scene.camera=camera
scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(OUT,'blender-demo.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'blender-demo.blend'));bpy.ops.render.render(write_still=True)
print('BLENDER_DEMO_RENDERED',scene.render.filepath)
