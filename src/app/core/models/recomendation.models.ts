export interface OAData {
    recommendationId: number;
    estimatedDuration: number; // minutes
    fileExtension: string;
    fileName: string;
    idObject: number;
    levelName: string;
    s3Url: string;
    styleName: string;
    stylePercentage: number;
    title: string;
    topicName:string;
    typeName: string;
}

export interface Recommendation {
    topicId: string;
    topicName: string;
    domainLevel: number;
    learningObjects: OAData[];
    status?: 'PENDING' | 'READY' | 'FAILED';
}