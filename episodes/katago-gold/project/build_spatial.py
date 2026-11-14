"""Blender emissive coordinate lattice exported as actual glTF geometry."""
import bpy, math, os
from pathlib import Path
ROOT=Path(os.environ.get('KATAGO_REPO','/workspace/vibeknowledge'));OUT=ROOT/'tools/remotion/public/gold-katago/abstract'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,col,metal,em):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.23;p.inputs['Emission Color'].default_value=(*col,1);p.inputs['Emission Strength'].default_value=em;return m
gold=mat('Champagne-gold filament',(.66,.39,.1),.9,.45);node=mat('Polished gold intersection',(.87,.62,.25),.85,.75)
for i in range(19):
 q=(i-9)*.37
 for pts in [[(q,-3.33,0),(q,3.33,0)],[(-3.33,q,0),(3.33,q,0)]]:
  c=bpy.data.curves.new('Coordinate filament','CURVE');c.dimensions='3D';c.bevel_depth=.009;c.bevel_resolution=3;s=c.splines.new('POLY');s.points.add(1)
  for p,v in zip(s.points,pts):p.co=(*v,1)
  o=bpy.data.objects.new('Gold line',c);bpy.context.scene.collection.objects.link(o);o.data.materials.append(gold)
for x in range(19):
 for y in range(19):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.034,location=((x-9)*.37,(y-9)*.37,math.sin(x*.45+y*.28)*.045));bpy.context.object.data.materials.append(node)
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=bpy.context.selected_objects[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'katago-spatial-lattice.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'katago-spatial-lattice.glb'),use_selection=True,export_format='GLB',export_yup=True)
