import {
  IEntityBase,
  IOfflineEntity,
} from '../store/OfflineStorage';

export class StoredShader extends IEntityBase implements IOfflineEntity {

    thumbnail:string | undefined;   
    documents: IDocumentData[]
    

    constructor(public name: string, public description: string,public typeofShader:number) {
        super();
        this.documents = new Array<IDocumentData>();

    }

    addDocument(name:string,source:string, type:TypeOfShader){

        this.documents.push({
            name: name,source:source, type:type
        });
        
    }
  
}

export enum TypeOfShader {
    MainFrag = 0,
    Frag = 1,
    Compute = 2
  }

  export  const getShadeTypeName = (shaderType: TypeOfShader): string => {
    switch (shaderType) {
        case TypeOfShader.MainFrag:
            return "Main Fragment Shader";
        case TypeOfShader.Frag:
            return "Fragment Shader";
        case TypeOfShader.Compute:
            return "Compute Shader";
        default:
            return "Unknown Shader Type";
    }
}

export interface IDocumentData {
    name: string;
    source: string;
    type: TypeOfShader
  }
