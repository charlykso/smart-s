import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import classArmService, { ClassArmStudentCount } from '../../services/classArmService';
import CenteredLoader from '../common/CenteredLoader';

interface ClassArmStudentCountProps {
  classArmId?: string;
  showAllClassArms?: boolean;
}

const ClassArmStudentCountComponent: React.FC<ClassArmStudentCountProps> = ({
  classArmId,
  showAllClassArms = false
}) => {
  const [classArmData, setClassArmData] = useState<ClassArmStudentCount | null>(null);
  const [allClassArms, setAllClassArms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStudents, setShowStudents] = useState<string | null>(null);

  useEffect(() => {
    if (showAllClassArms) {
      fetchAllClassArms();
    } else if (classArmId) {
      fetchClassArmData();
    }
  }, [classArmId, showAllClassArms]);

  const fetchClassArmData = async () => {
    if (!classArmId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await classArmService.getClassArmWithStudentCount(classArmId);
      setClassArmData(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClassArms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classArmService.getAllClassArms();
      setAllClassArms(response.classArms || response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudentCount = async (targetClassArmId: string) => {
    try {
      setUpdating(targetClassArmId);
      setError(null);
      
      await classArmService.updateClassArmStudentCount(targetClassArmId);
      
      // Refresh data
      if (showAllClassArms) {
        await fetchAllClassArms();
      } else {
        await fetchClassArmData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateAllStudentCounts = async () => {
    try {
      setUpdating('all');
      setError(null);
      
      const response = await classArmService.updateAllClassArmsStudentCount();
      
      if (response.success) {
        // Refresh data
        await fetchAllClassArms();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const toggleShowStudents = async (targetClassArmId: string) => {
    if (showStudents === targetClassArmId) {
      setShowStudents(null);
      return;
    }

    try {
      const response = await classArmService.getClassArmWithStudentCount(targetClassArmId);
      setShowStudents(targetClassArmId);
      
      // Update the classArm data with student list
      if (showAllClassArms) {
        setAllClassArms(prev => prev.map(ca => 
          ca._id === targetClassArmId 
            ? { ...ca, students: response.data.students }
            : ca
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <CenteredLoader message="Loading classArm data..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!showAllClassArms && classArmData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {classArmData.classArm.name} - Student Count
          </h3>
          <button
            onClick={() => handleUpdateStudentCount(classArmData._id)}
            disabled={updating === classArmData._id}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating === classArmData._id ? 'animate-spin' : ''}`} />
            Update Count
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Current Count</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{classArmData.currentStudentCount}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <p className="text-sm font-medium text-green-600">
              Live Count - Always Accurate
            </p>
          </div>
        </div>

        {classArmData.students && classArmData.students.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Students in this Class</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {classArmData.students.map((student, index) => (
                <div key={student._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <span className="font-medium">{student.firstname} {student.lastname}</span>
                    <span className="text-gray-500 ml-2">({student.regNo})</span>
                  </div>
                  <span className="text-sm text-gray-500">{student.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showAllClassArms) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">ClassArm Student Counts</h2>
          <button
            onClick={handleUpdateAllStudentCounts}
            disabled={updating === 'all'}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating === 'all' ? 'animate-spin' : ''}`} />
            Update All Counts
          </button>
        </div>

        {allClassArms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No classArms found. Create some classArms to see student counts.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allClassArms.map((classArm) => (
              <div key={classArm._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{classArm.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleShowStudents(classArm._id)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="View students"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStudentCount(classArm._id)}
                      disabled={updating === classArm._id}
                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                      title="Update count"
                    >
                      <RefreshCw className={`h-4 w-4 ${updating === classArm._id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">Live Count</span>
                  </div>
                  
                  {classArm.school && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">School:</span>
                      <span className="text-gray-800">{classArm.school.name}</span>
                    </div>
                  )}
                </div>

                {showStudents === classArm._id && classArm.students && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Students:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {classArm.students.map((student: any) => (
                        <div key={student._id} className="text-xs text-gray-600">
                          {student.firstname} {student.lastname} ({student.regNo})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ClassArmStudentCountComponent;
