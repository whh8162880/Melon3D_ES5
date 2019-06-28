///<reference path="../Mesh.ts" />

module rf{

    export function mesh_cut(mesh:Mesh){
        let cut = new CutMesh();

        let {geometry,skData,sceneTransform,material} = mesh;

        cut.geometry = geometry;

        if(skData){
            cut.skData = {} as ISkeletonRenderData;
            cut.skData.skeleton = skData.skeleton;
            cut.skData.matrices = skData.matrices.clone() as Float32Array;
        }
        
        let m = new Material();
        m.setData(undefined);

        m.diffTex = mesh.material.diffTex;   
        cut.material = m;

        cut.setTransform(sceneTransform);

        return cut;
    }


    export function mesh_fre_alpha_cut(mesh:Mesh){
        let cut = new CutMesh();

        let {geometry,skData,sceneTransform,material} = mesh;

        cut.geometry = geometry;

        if(skData){
            cut.skData = {} as ISkeletonRenderData;
            cut.skData.skeleton = skData.skeleton;
            cut.skData.matrices = skData.matrices.clone() as Float32Array;
        }
        
        let m = new ColorMaterial(0xFFFFFF);
        m.setData(undefined);
        m.sun = false;

        cut.addFilter(new FresnelAlphaFilter(1.0));
        cut.addFilter(new ColorTransformFilter());
        m.diffTex = mesh.material.diffTex;   
        cut.material = m;

        cut.setTransform(sceneTransform);

        return cut;
    }



    // export class 


    export class CutMesh extends Mesh{

        render(camera:Camera,option:IRenderOption){
            super.render(camera,option);
        }

    }
}